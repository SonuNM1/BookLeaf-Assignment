import type { Request, Response } from "express";
import { Ticket } from "../models/Ticket.model.js";
import { Author } from "../models/Author.model.js";
import { generateTicketNumber } from "../utils/ticketNumber.js";

// author creating a new support ticket

export const createTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { book_id, subject, description } = req.body;

    console.log('Received body:', { book_id, subject, description });

    // validating the required fields

    if (!subject || !description) {
      res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Subject and description are required",
      });
      return;
    }

    if (subject.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: "INVALID_SUBJECT",
        message: "Subject must be at least 5 characters",
      });
      return;
    }

    if (description.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: "INVALID_DESCRIPTION",
        message: "Description must be at least 10 characters",
      });
      return;
    }

    // fetch author to get their name and validate book_id

    const author = await Author.findOne({
      author_id: req.user?.author_id,
    });

    if (!author) {
      res.status(404).json({
        success: false,
        error: "AUTHOR_NOT_FOUND",
        message: "Author profile not found",
      });
      return;
    }

    // if book_id provided, verify it belongs to this author - prevents author from raising ticket for any other author's book

    let book_title: string | null = null;

    if (book_id) {
      const book = author.books.find((b) => b.book_id === book_id);

      if (!book) {
        res.status(400).json({
          success: false,
          error: "INVALID_BOOK",
          message: "Book not found or doesn't belong to you",
        });
        return;
      }
      book_title = book.title;
    }

    const ticket_number = await generateTicketNumber();

    // creating the ticket - ai_category defaults to 'Pending' - AI will classify async, ai_priority defaults to 'Medium' - AI will score async

    const ticket = await Ticket.create({
      ticket_number,
      author_id: author._id,
      author_name: author.name,
      book_id: book_id || null,
      book_title: book_title || null,
      subject: subject.trim(),
      description: description.trim(),
      status: "Open",
      messages: [
        {
          sender_role: "author",
          sender_name: author.name,
          content: description.trim(),
          sent_at: new Date(),
          is_ai_drafted: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: { ticket },
    });

    // trigger AI classification here after response is sent - we will add this ini the AI integration setup
  } catch (error) {
    console.error("createTicket error: ", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// return all ticket belonging to the logged-in author - GET

export const getMyTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const author = await Author.findOne({
      author_id: req.user?.author_id,
    });

    if (!author) {
      res.status(404).json({
        success: false,
        error: "AUTHOR_NOT_FOUND",
        message: "Author profile not found",
      });
      return;
    }

    // sorting by newest first so author sees latest ticekts at the top

    const tickets = await Ticket.find({ author_id: author._id })
      .sort({ created_at: -1 })
      .select("-internal_notes");

    res.status(200).json({
      success: true,
      data: {
        total: tickets.length,
        tickets,
      },
    });
  } catch (error) {
    console.error("getMyTickets error: ", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

// return a single ticket - only if it belongs to the author (GET)

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findOne({
      author_id: req.user?.author_id,
    });

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'AUTHOR_NOT_FOUND',
        message: 'Author profile not found',
      });
      return;
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      author_id: author._id, // ensures author can only see own tickets
    }).select('-internal_notes'); // never expose internal notes to author

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: 'Ticket not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    console.error('getTicketById error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};
