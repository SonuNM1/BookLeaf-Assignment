import mongoose, { Schema, Document } from 'mongoose';
import type { TicketStatus, TicketCategory, TicketPriority } from '../types/index.js';

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender_role: 'author' | 'admin';
  sender_name: string;
  content: string;
  sent_at: Date;
  is_ai_drafted: boolean;
}

export interface IInternalNote {
  _id?: mongoose.Types.ObjectId;
  admin_name: string;
  content: string;
  created_at: Date;
}

export interface ITicket extends Document {
  ticket_number: string;
  author_id: mongoose.Types.ObjectId;
  author_name: string;
  book_id: string | null;
  book_title: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  assigned_to: mongoose.Types.ObjectId | null;
  ai_category: TicketCategory;
  ai_priority: TicketPriority;
  ai_confidence: number | null;
  category_overridden: boolean;
  priority_overridden: boolean;
  messages: IMessage[];
  internal_notes: IInternalNote[];
  created_at: Date;
  updated_at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender_role: { type: String, enum: ['author', 'admin'], required: true },
    sender_name: { type: String, required: true },
    content: { type: String, required: true },
    sent_at: { type: Date, default: Date.now },
    is_ai_drafted: { type: Boolean, default: false },
  },
  { _id: true }
);

const InternalNoteSchema = new Schema<IInternalNote>(
  {
    admin_name: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TicketSchema = new Schema<ITicket>(
  {
    ticket_number: { type: String, required: true, unique: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
    author_name: { type: String, required: true },
    book_id: { type: String, default: null },
    book_title: { type: String, default: null },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // AI fields
    ai_category: {
      type: String,
      enum: [
        'Royalty & Payments',
        'ISBN & Metadata Issues',
        'Printing & Quality',
        'Distribution & Availability',
        'Book Status & Production Updates',
        'General Inquiry',
        'Pending',
      ],
      default: 'Pending',
    },
    ai_priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    ai_confidence: { type: Number, default: null },
    category_overridden: { type: Boolean, default: false },
    priority_overridden: { type: Boolean, default: false },

    messages: [MessageSchema],
    internal_notes: [InternalNoteSchema],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);