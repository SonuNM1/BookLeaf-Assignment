import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/tickets/${id}`)
        setTicket(res.data.data.ticket)
      } catch {
        toast.error('Failed to load ticket')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTicket()
  }, [id])

  useEffect(() => {
    const socket = getSocket()

    const handleUpdate = (data: { ticketId: string; ticket: Ticket }) => {
      if (data.ticketId === id) {
        setTicket(data.ticket)
        toast.info('Ticket updated by BookLeaf team')
      }
    }

    socket.on('ticket:updated', handleUpdate)
    return () => { socket.off('ticket:updated', handleUpdate) }
  }, [id])

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })

  if (isLoading) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-sm text-slate-400">Loading ticket...</p>
      </div>
    </Layout>
  )

  if (!ticket) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-sm text-slate-400 mb-3">Ticket not found</p>
        <Link to="/author/tickets" className="text-sm text-blue-700">
          ← Back to tickets
        </Link>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-9">

        <Link
          to="/author/tickets"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5 inline-block"
        >
          ← Back to tickets
        </Link>

        {/* ticket header card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-3">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">
                {ticket.ticket_number}
                {ticket.book_title && ` · ${ticket.book_title}`}
              </p>
              <h1
                className="text-lg font-medium text-slate-800"
                style={{ fontFamily: 'Lora, serif' }}
              >
                {ticket.subject}
              </h1>
            </div>
            <span className={`text-xs font-medium px-3 py-1 whitespace-nowrap rounded-full shrink-0 ml-4 ${statusStyles[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>

          <div className="flex gap-4">
            <p className="text-xs text-slate-400">
              Category: <span className="text-slate-600">{ticket.ai_category}</span>
            </p>
            <p className="text-xs text-slate-400">
              Priority: <span className="text-slate-600 whitespace-nowrap">{ticket.ai_priority}</span>
            </p>
          </div>
        </div>

        {/* conversation thread */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-5">
            Conversation
          </p>

          <div className="flex flex-col gap-4">
            {ticket.messages.map((message) => (
              <div
                key={message._id}
                className={`p-4 rounded-lg border-l-2 ${
                  message.sender_role === 'author'
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-medium ${
                      message.sender_role === 'author'
                        ? 'text-slate-600'
                        : 'text-blue-700'
                    }`}>
                      {message.sender_name}
                    </p>
                    {message.is_ai_drafted && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                        AI assisted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatTime(message.sent_at)}
                  </p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {message.content}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default TicketDetail