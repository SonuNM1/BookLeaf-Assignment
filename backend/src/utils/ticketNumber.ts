import { Ticket } from "../models/Ticket.model.js";

// generating human readable ticket number 

export const generateTicketNumber = async (): Promise<string> => {
    const year = new Date().getFullYear() ; 

    // counting existing tickets to determine the next number 

    const count = await Ticket.countDocuments() ; 

    const sequence = String(count + 1).padStart(4, '0') ; 

    return `TKT-${year}-${sequence}` ; 
}