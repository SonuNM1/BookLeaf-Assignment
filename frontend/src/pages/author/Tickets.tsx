import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api.js'
import { getSocket } from '../../socket/index.js'
import type { Ticket } from '../../types/index.js'
import Layout from '../../components/shared/Layout.js'

const statusStyles: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Closed': 'bg-slate-100 text-slate-500',
}

const priorityStyles: Record<string, string> = {
  'Critical': 'bg-red-100 text-red-800',
  'High': 'bg-orange-100 text-orange-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800',
  'Pending': 'bg-slate-100 text-slate-500',
}

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets/mine')
        setTickets(res.data.data.tickets)
      } catch {
        toast.error('Failed to load tickets')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTickets()
  }, [])

  useEffect(() => {
    const socket = getSocket()

    const handleTicketUpdated = (data: { ticketId: string; ticket: Ticket }) => {
      setTickets((prev) =>
        prev.map((t) => t._id === data.ticketId ? data.ticket : t)
      )
      toast.info('Your ticket has been updated by the BookLeaf team')
    }

    socket.on('ticket:updated', handleTicketUpdated)
    return () => { socket.off('ticket:updated', handleTicketUpdated) }
  }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  return (
    <Layout>

      <div className="max-w-4xl mx-auto px-6 py-9">

        {/* header */}
        <div className="flex items-end justify-between mb-7 pb-5 border-b border-slate-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
              Support
            </p>
            <h1 className="text-2xl font-medium text-slate-800" style={{ fontFamily: 'Lora, serif' }}>
              My Tickets
            </h1>
          </div>
          <Link
            to="/author/tickets/new"
            className="text-sm bg-blue-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            + New Ticket
          </Link>
        </div>

        {/* loading */}
        {isLoading && (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400">Loading your tickets...</p>
          </div>
        )}

        {/* empty state */}
        {!isLoading && tickets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-3xl mb-3">🎫</p>
            <p className="text-base font-medium text-slate-700 mb-1"
              style={{ fontFamily: 'Lora, serif' }}>
              No tickets yet
            </p>
            <p className="text-sm text-slate-400 mb-5">
              Have a question? Raise a support ticket and we will get back to you.
            </p>
            <Link
              to="/author/tickets/new"
              className="text-sm bg-blue-800 text-white px-5 py-2 rounded-lg hover:bg-blue-900 transition-colors"
            >
              Raise your first ticket
            </Link>
          </div>
        )}

        {/* tickets list */}
        {!isLoading && tickets.length > 0 && (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/author/tickets/${ticket._id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 transition-colors no-underline"
              >
                {/* top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-slate-800 mb-1">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ticket.ticket_number}
                      {ticket.book_title && ` · ${ticket.book_title}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-xs font-medium px-3 py-1 whitespace-nowrap rounded-full ${priorityStyles[ticket.ai_priority]}`}>
                      {ticket.ai_priority}
                    </span>
                  </div>
                </div>

                {/* bottom row */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                    {' · '}
                    {ticket.ai_category !== 'Pending' ? ticket.ai_category : 'Classifying...'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
      </Layout>
  )
}

export default Tickets