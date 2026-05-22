import type { Request, Response } from "express";
import { Ticket } from "../models/Ticket.model.js";
import { Author } from "../models/Author.model.js";
import { generateDraftResponse } from "../services/ai.service.js";

// returns all tickets across all authors with filtering support

export const getAllTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // query params for filtering

    const { status, priority, category, author_name } = req.query;

    // building filter object dynamically

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (priority) filter.ai_priority = priority;
    if (category) filter.ai_category = category;

    // case-insensitive search on author name

    if (author_name) {
      filter.author_name = { $regex: author_name, $options: "i" };
    }

    // most urgent first - critical on top, then by oldest date - this ensures urgent old tickets never get buried. Internal notes load only when admin opens a specific ticket.

    const tickets = await Ticket.find(filter)
      .sort({
        ai_priority: 1,
        created_at: 1,
      })
      .select("-internal_notes -messages");

    res.status(200).json({
      success: true,
      data: {
        total: tickets.length,
        tickets,
      },
    });
  } catch (error) {
    console.error("getAllTickets error: ", error);

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// return full ticket including messages and internal notes (GET)

export const getTicketByIdAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // admin sees everything including internal_notes

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });
      return;
    }

    // also fetching the author's full profile so admin can see book data while reviewing the ticket

    const author = await Author.findById(ticket.author_id);

    // building book context only if ticket is about a specific book - avoiding sending irrelevant data to AI for cost awareness 

    let bookContext = null ;

    if(ticket.book_id && author) {
      const book = author.books.find((b) => b.book_id === ticket.book_id) ; 

      if(book) {
        bookContext = {
          title: book.title, 
          status: book.status, 
          royalty_pending: book.royalty_pending, 
          royalty_paid: book.royalty_paid, 
          total_copies_sold: book.total_copies_sold, 
          last_royalty_payout_date: book.last_royalty_payout_date ? book.last_royalty_payout_date.toISOString() : null 
        }
      }
    }

    // generating draft - returning null if AI fails 

    const aiDraft = await generateDraftResponse(
      ticket.author_name, 
      ticket.subject, 
      ticket.description, 
      bookContext
    )

    res.status(200).json({
      success: true,
      data: {
        ticket,
        author,
        ai_draft: aiDraft, // null means AI unavailable - frontend handles this gracefully 
      },
    });
  } catch (error) {
    console.error("getTicketByIdAdmin error: ", error);

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// admin sends a response to the author - POST

export const respondToTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content, is_ai_drafted } = req.body;

    if (!content || content.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: "MISSING_CONTENT",
        message: "Response content is required",
      });
      return;
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });
      return;
    }

    // pushing new messages into the messages array - $push adds to array without replacing the whole document - also tracking whether this was AI drafted or manually written, useful for analytics - how often do admins use AI drafts?

    await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          messages: {
            sender_role: "admin",
            sender_name: "BookLeaf Support",
            content: content.trim(),
            sent_at: new Date(),
            is_ai_drafted: is_ai_drafted || false,
          },
        },
        // automatically move ticket to In Progress when admin responds
        status: "In Progress",
      },
      { new: true },
    );

    const updatedTicket = await Ticket.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Response sent successfully",
      data: { ticket: updatedTicket },
    });

    // TODO: emit socket event here so author sees response in real time. We will add this in the Socket.IO step
  } catch (error) {
    console.error("respondToTicket error: ", error);

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// Update ticket status, assign to self - PATCH

export const updateTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, assigned_to } = req.body;

    // only allow updating specific fields - prevents admin from accidentally overwriting AI fields or messages

    const allowedUpdates: Record<string, unknown> = {};

    if (status) {
      const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];

      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: "INVALID_STATUS",
          message: "Status must be Open, In Progress, Resolved or Closed",
        });
        return;
      }
      allowedUpdates.status = status;
    }

    if (assigned_to !== undefined) {
      allowedUpdates.assigned_to = assigned_to;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true },
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("updateTicket error: ", error);

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// add internal note - never visible to author (POST)

export const addInternalNote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: "MISSING_CONTENT",
        message: "Note content is required",
      });
      return;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          internal_notes: {
            admin_name: "BookLeaf Support",
            content: content.trim(),
            created_at: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Internal note added",
      data: {
        internal_notes: ticket.internal_notes,
      },
    });
  } catch (error) {
    console.error("addInternalNote error:", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// Override AI classification or priority - PATCH

export const overrideClassification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ai_category, ai_priority } = req.body;

    const validCategories = [
      "Royalty & Payments",
      "ISBN & Metadata Issues",
      "Printing & Quality",
      "Distribution & Availability",
      "Book Status & Production Updates",
      "General Inquiry",
    ];

    const validPriorities = ["Critical", "High", "Medium", "Low"];

    const updates: Record<string, unknown> = {};

    if (ai_category) {
      if (!validCategories.includes(ai_category)) {
        res.status(400).json({
          success: false,
          error: "INVALID_CATEGORY",
          message: "Invalid category value",
        });
        return;
      }
      updates.ai_category = ai_category;

      // flag that human overrode the AI decision

      updates.category_overridden = true;
    }

    if (ai_priority) {
      if (!validPriorities.includes(ai_priority)) {
        res.status(400).json({
          success: false,
          error: "INVALID_PRIORITY",
          message: "Priority must be Critical, High, Medium or Low",
        });
        return;
      }
      updates.ai_priority = ai_priority;
      updates.priority_overridden = true;
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Classification updated successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("overrideClassification error: ", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// list all authors - useful for admin overview - GET

export const getAllAuthors = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authors = await Author.find().select("-books");

    res.status(200).json({
      success: true,
      data: {
        total: authors.length,
        authors,
      },
    });
  } catch (error) {
    console.error("getAllAuthors error: ", error);

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// get single author with full book data - GET

export const getAuthorById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const author = await Author.findOne({
      author_id: req.params.author_id,
    });

    if (!author) {
      res.status(404).json({
        success: false,
        error: "AUTHOR_NOT_FOUND",
        message: "Author not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { author },
    });
  } catch (error) {
    console.error("getAuthorById error:", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};
