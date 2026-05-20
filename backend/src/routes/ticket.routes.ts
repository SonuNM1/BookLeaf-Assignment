import {Router} from "express"
import { createTicket, getMyTickets, getTicketById } from "../controllers/ticket.controller.js"
import { protect, restrictTo } from "../middleware/auth.middleware.js"

const router = Router() ; 

// all ticket routes require login AND author role 

router.use(protect, restrictTo('author'))

router.post('/', createTicket) ; 
router.get('/mine', getMyTickets)
router.get('/:id', getTicketById)

export default router ; 