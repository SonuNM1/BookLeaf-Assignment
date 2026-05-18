export type UserRole = 'author' | 'admin'

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

export type TicketCategory = 
    | 'Royalty & Payments'
    | 'ISBN & Metadata Issues'
    | 'Printing & Quality'
    | 'Distribution & Availability'
    | 'Book Status & Production Updates'
    | 'General Inquiry'
    | 'Pending'

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low'