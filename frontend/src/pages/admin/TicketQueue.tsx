import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '../../components/shared/Layout.js'
import api from '../../services/api.js'
import { getSocket } from '../../socket/index.js'
import type { Ticket } from '../../types/index.js'

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

const priorityOrder: Record<string, number> = {
  'Critical': 0,
  'High': 1,
  'Medium': 2,
  'Low': 3,
  'Pending': 4,
}

const TicketQueue = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // useCallback so fetchTickets can be used in useEffect
  // without causing infinite re-render loops
  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const res = await api.get(`/admin/tickets?${params.toString()}`)
      setTickets(res.data.data.tickets)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, priorityFilter, categoryFilter])

  // refetch whenever filters change
  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // socket listeners
  useEffect(() => {
    const socket = getSocket()

    // new ticket arrives — refetch queue and notify admin
    const handleNewTicket = (data: {
      ticket_number: string
      author_name: string
      subject: string
    }) => {
      toast.info(`New ticket from ${data.author_name}: ${data.subject}`)
      fetchTickets()
    }

    // AI classification completed — update that ticket in state
    // without refetching the whole list
    const handleClassified = (data: {
      ticketId: string
      ai_category: string
      ai_priority: string
      ai_confidence: number
    }) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === data.ticketId
            ? {
                ...t,
                ai_category: data.ai_category as Ticket['ai_category'],
                ai_priority: data.ai_priority as Ticket['ai_priority'],
                ai_confidence: data.ai_confidence,
              }
            : t
        )
      )
    }

    socket.on('ticket:created', handleNewTicket)
    socket.on('ticket:classified', handleClassified)

    // cleanup both listeners on unmount
    return () => {
      socket.off('ticket:created', handleNewTicket)
      socket.off('ticket:classified', handleClassified)
    }
  }, [fetchTickets])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  // sort by priority first then by oldest date
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityDiff =
      priorityOrder[a.ai_priority] - priorityOrder[b.ai_priority]
    if (priorityDiff !== 0) return priorityDiff
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  const selectClass =
    'text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 outline-none focus:border-blue-400 cursor-pointer'

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-9">

        {/* header */}
        <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
              Admin
            </p>
            <h1
              className="text-2xl font-medium text-slate-800"
              style={{ fontFamily: 'Lora, serif' }}
            >
              Ticket Queue
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Live updates on
          </div>
        </div>

        {/* filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Categories</option>
            <option>Royalty & Payments</option>
            <option>ISBN & Metadata Issues</option>
            <option>Printing & Quality</option>
            <option>Distribution & Availability</option>
            <option>Book Status & Production Updates</option>
            <option>General Inquiry</option>
          </select>

          {(statusFilter || priorityFilter || categoryFilter) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setPriorityFilter('')
                setCategoryFilter('')
              }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 cursor-pointer"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400 self-center">
            {sortedTickets.length} ticket
            {sortedTickets.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* loading */}
        {isLoading && (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400">Loading tickets...</p>
          </div>
        )}

        {/* empty */}
        {!isLoading && sortedTickets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm text-slate-400">
              No tickets match your filters
            </p>
          </div>
        )}

        {/* tickets table */}
        {!isLoading && sortedTickets.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

            {/* table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="col-span-1 text-xs font-medium text-slate-400">
                Priority
              </p>
              <p className="col-span-4 text-xs font-medium text-slate-400">
                Ticket
              </p>
              <p className="col-span-2 text-xs font-medium text-slate-400">
                Author
              </p>
              <p className="col-span-2 text-xs font-medium text-slate-400">
                Category
              </p>
              <p className="col-span-1 text-xs font-medium text-slate-400">
                Status
              </p>
              <p className="col-span-2 text-xs font-medium text-slate-400 text-right">
                Date
              </p>
            </div>

            {/* rows */}
            {sortedTickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/admin/tickets/${ticket._id}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-100 hover:bg-blue-50 transition-colors no-underline last:border-0 cursor-pointer"
              >
                {/* priority */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${priorityStyles[ticket.ai_priority]}`}
                  >
                    {ticket.ai_priority}
                  </span>
                </div>

                {/* subject */}
                <div className="col-span-4 flex flex-col justify-center">
                  <p className="text-sm font-medium text-slate-800 mb-0.5 truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {ticket.ticket_number}
                    {ticket.book_title && ` · ${ticket.book_title}`}
                  </p>
                </div>

                {/* author */}
                <div className="col-span-2 flex items-center">
                  <p className="text-sm text-slate-600 truncate">
                    {ticket.author_name}
                  </p>
                </div>

                {/* category */}
                <div className="col-span-2 flex items-center">
                  <p className="text-xs text-slate-500 truncate">
                    {ticket.ai_category === 'Pending'
                      ? '⏳ Classifying...'
                      : ticket.ai_category}
                  </p>
                </div>

                {/* status */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* date */}
                <div className="col-span-2 flex items-center justify-end">
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

export default TicketQueue