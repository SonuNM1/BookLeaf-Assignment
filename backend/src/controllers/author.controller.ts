import type { Request, Response } from 'express';
import { Author } from '../models/Author.model.js';

// GET /api/authors/me
// returns the logged-in author's profile + all their books
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findOne({ 
      author_id: req.user?.author_id 
    });

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'AUTHOR_NOT_FOUND',
        message: 'Author profile not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { author },
    });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};

// GET /api/authors/me/books
// returns only the books array — cleaner for the My Books page
export const getMyBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findOne({ 
      author_id: req.user?.author_id 
    // select only the books and name field, skip other author fields
    }).select('name books author_id');

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'AUTHOR_NOT_FOUND',
        message: 'Author profile not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        author_id: author.author_id,
        name: author.name,
        // total books count useful for dashboard stats
        total_books: author.books.length,
        books: author.books,
      },
    });
  } catch (error) {
    console.error('getMyBooks error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};

// GET /api/authors/me/royalties
// returns a royalty summary across all books
// useful for the dashboard overview card
export const getMyRoyalties = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findOne({ 
      author_id: req.user?.author_id 
    }).select('name books');

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'AUTHOR_NOT_FOUND',
        message: 'Author profile not found',
      });
      return;
    }

    // calculate totals by reducing over all books
    // reduce() walks through each book and accumulates values
    const summary = author.books.reduce(
      (acc, book) => {
        acc.total_copies_sold += book.total_copies_sold;
        acc.total_royalty_earned += book.total_royalty_earned;
        acc.royalty_paid += book.royalty_paid;
        acc.royalty_pending += book.royalty_pending;
        return acc;
      },
      // initial accumulator values — all zero
      {
        total_copies_sold: 0,
        total_royalty_earned: 0,
        royalty_paid: 0,
        royalty_pending: 0,
      }
    );

    // per-book royalty breakdown for detailed view
    const breakdown = author.books.map((book) => ({
      book_id: book.book_id,
      title: book.title,
      status: book.status,
      total_copies_sold: book.total_copies_sold,
      total_royalty_earned: book.total_royalty_earned,
      royalty_paid: book.royalty_paid,
      royalty_pending: book.royalty_pending,
      last_royalty_payout_date: book.last_royalty_payout_date,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary,
        breakdown,
      },
    });
  } catch (error) {
    console.error('getMyRoyalties error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};