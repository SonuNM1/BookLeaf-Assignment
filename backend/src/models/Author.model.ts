import mongoose, {Schema, Document} from "mongoose"

// book is embedded inside Author 

export interface IBook {
    book_id: string; 
    title: string; 
    isbn: string; 
    genre: string; 
    ppublication_date: Date | null;
    status: string; 
    mrp: number | null; 
    author_royalty_per_copy: number | null; 
    total_royalty_earned: number ; 
    royalty_paid: number ; 
    royalty_pending: number; 
    last_royalty_payout_date: Date | null; 
    print_partner: string | null ; 
    available_on: string[] ; 
}

export interface IAuthor extends Document {
    author_id: string; 
    name: string; 
    email: string; 
    phone: string; 
    city: string; 
    joined_date: Date; 
    books: IBook[]
}

const BookSchema = new Schema<IBook>(
  {
    book_id: { type: String, required: true },
    title: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: { type: String, required: true },
    publication_date: { type: Date, default: null },
    status: { type: String, required: true },
    mrp: { type: Number, default: null },
    author_royalty_per_copy: { type: Number, default: null },
    total_copies_sold: { type: Number, default: 0 },
    total_royalty_earned: { type: Number, default: 0 },
    royalty_paid: { type: Number, default: 0 },
    royalty_pending: { type: Number, default: 0 },
    last_royalty_payout_date: { type: Date, default: null },
    print_partner: { type: String, default: null },
    available_on: [{ type: String }],
  },
  { _id: false } // books don't need their own _id, book_id is enough
);

const AuthorSchema = new Schema<IAuthor>(
  {
    author_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    joined_date: { type: Date, required: true },
    books: [BookSchema],
  },
  { timestamps: false }
);

export const Author = mongoose.model<IAuthor>('Author', AuthorSchema);