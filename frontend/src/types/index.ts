export type UserRole = "author" | "admin" ; 
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketCategory =
  | 'Royalty & Payments'
  | 'ISBN & Metadata Issues'
  | 'Printing & Quality'
  | 'Distribution & Availability'
  | 'Book Status & Production Updates'
  | 'General Inquiry'
  | 'Pending';

export interface User {
    id: string; 
    email: string; 
    role: UserRole; 
    author_id: string | null ;
}

export interface Book {
    book_id: string; 
    title: string; 
    isbn: string; 
    genre: string; 
    publication_date: string | null ; 
    status: string ; 
    mrp: number | null ;
    author_royalty_per_copy: number | null; 
    total_copies_sold: number; 
    total_royalty_earned: number; 
    royalty_paid: number; 
    royalty_pending: number; 
    last_royalty_payout_date: string | null; 
    print_partner: string | null; 
    available_on: string[] ; 
}

export interface Author {
    _id: string;
    author_id: string; 
    name: string;
    email: string; 
    phone: string; 
    city: string; 
    joined_date: string; 
    books: Book[]
}

export interface Message {
    _id: string; 
    sender_role: 'author' | 'admin'; 
    sender_name: string; 
    content: string; 
    sent_at: string; 
    is_ai_drafted: boolean; 
}

export interface InternalNote {
    _id: string; 
    admin_name: string ; 
    content: string; 
    created_at: string 
}

export interface Ticket {
  _id: string;
  ticket_number: string;
  author_id: string;
  author_name: string;
  book_id: string | null;
  book_title: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  assigned_to: string | null;
  ai_category: TicketCategory;
  ai_priority: TicketPriority;
  ai_confidence: number | null;
  category_overridden: boolean;
  priority_overridden: boolean;
  messages: Message[];
  internal_notes?: InternalNote[];
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  author: Author | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}