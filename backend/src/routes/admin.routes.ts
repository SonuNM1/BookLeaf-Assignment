import { Router } from "express";
import { getAllTickets, getTicketByIdAdmin, respondToTicket, updateTicket, addInternalNote, overrideClassification, getAllAuthors, getAuthorById } from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router() ; 

// every admin route requires login AND admin role 

router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketByIdAdmin);
router.patch('/tickets/:id', updateTicket);
router.post('/tickets/:id/respond', respondToTicket);
router.post('/tickets/:id/notes', addInternalNote);
router.patch('/tickets/:id/classify', overrideClassification);

// author routes 

router.get('/authors', getAllAuthors);
router.get('/authors/:author_id', getAuthorById);

export default router ; 