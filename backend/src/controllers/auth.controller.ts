import type { Request, Response } from 'express';
import { User } from '../models/User.model.js';
import { Author } from '../models/Author.model.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // basic input check
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      author_id: user.author_id || null,
    });

    let authorProfile = null;
    if (user.role === 'author' && user.author_id) {
      authorProfile = await Author.findOne({ author_id: user.author_id });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          author_id: user.author_id || null,
        },
        author: authorProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    let authorProfile = null;
    if (user.role === 'author' && user.author_id) {
      authorProfile = await Author.findOne({ author_id: user.author_id });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          author_id: user.author_id || null,
        },
        author: authorProfile,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    });
  }
};