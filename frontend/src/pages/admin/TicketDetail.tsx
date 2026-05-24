import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api.js'
import type { Ticket, Author } from '../../types/index.js'
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

const CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry',
]

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

const AdminTicketDetail = () => {
  const { id } = useParams<{ id: string }>()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [author, setAuthor] = useState<Author | null>(null)
  const [aiDraft, setAiDraft] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const [response, setResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isAiDrafted, setIsAiDrafted] = useState(false)

  const [note, setNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const [isOverriding, setIsOverriding] = useState(false)
  const [overrideCategory, setOverrideCategory] = useState('')
  const [overridePriority, setOverridePriority] = useState('')

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/admin/tickets/${id}`)
        const { ticket: ticketData, author: authorData, ai_draft } = res.data.data

        setTicket(ticketData)
        setAuthor(authorData)
        setOverrideCategory(ticketData.ai_category)
        setOverridePriority(ticketData.ai_priority)

        if (ai_draft) {
          setAiDraft(ai_draft)
          setResponse(ai_draft)
          setIsAiDrafted(true)
        }
      } catch {
        toast.error('Failed to load ticket')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTicket()
  }, [id])

  const handleRespond = async () => {
    if (!response.trim()) {
      toast.error('Response cannot be empty')
      return
    }
    setIsSending(true)
    try {
      const res = await api.post(`/admin/tickets/${id}/respond`, {
        content: response.trim(),
        is_ai_drafted: isAiDrafted,
      })
      setTicket(res.data.data.ticket)
      setResponse('')
      setIsAiDrafted(false)
      toast.success('Response sent successfully')
    } catch {
      toast.error('Failed to send response')
    } finally {
      setIsSending(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Note cannot be empty')
      return
    }
    setIsAddingNote(true)
    try {
      await api.post(`/admin/tickets/${id}/notes`, {
        content: note.trim(),
      })
      const res = await api.get(`/admin/tickets/${id}`)
      setTicket(res.data.data.ticket)
      setNote('')
      toast.success('Internal note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleOverride = async () => {
    setIsOverriding(true)
    try {
      const res = await api.patch(`/admin/tickets/${id}/classify`, {
        ai_category: overrideCategory,
        ai_priority: overridePriority,
      })
      setTicket(res.data.data.ticket)
      toast.success('Classification updated')
    } catch {
      toast.error('Failed to update classification')
    } finally {
      setIsOverriding(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await api.patch(`/admin/tickets/${id}`, {
        status: newStatus,
      })
      setTicket(res.data.data.ticket)
      toast.success(`Status updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })

  // fixed — no Navbar reference
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
        <Link to="/admin/tickets" className="text-sm text-blue-700">
          ← Back to queue
        </Link>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-9">

        <Link
          to="/admin/tickets"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5 inline-block"
        >
          ← Back to queue
        </Link>

        <div className="grid grid-cols-3 gap-5">

          {/* LEFT COLUMN */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* ticket header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-3">
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
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${statusStyles[ticket.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 text-xs text-slate-400">
                <span>Author: <span className="text-slate-600">{ticket.author_name}</span></span>
                <span>Category: <span className="text-slate-600">{ticket.ai_category}</span></span>
                <span>Priority: <span className={`font-medium px-2 py-0.5 rounded ${priorityStyles[ticket.ai_priority]}`}>{ticket.ai_priority}</span></span>
              </div>
            </div>

            {/* conversation thread */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                Conversation
              </p>
              <div className="flex flex-col gap-3">
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
                            AI drafted
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

            {/* respond panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Write Response
                </p>
                {aiDraft && (
                  <button
                    onClick={() => {
                      setResponse(aiDraft)
                      setIsAiDrafted(true)
                      toast.info('AI draft loaded into editor')
                    }}
                    className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    ✦ Load AI Draft
                  </button>
                )}
              </div>

              {aiDraft && (
                <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <p className="text-xs font-medium text-indigo-700 mb-1">
                    ✦ AI Generated Draft
                  </p>
                  <p className="text-xs text-indigo-600 leading-relaxed line-clamp-3">
                    {aiDraft}
                  </p>
                </div>
              )}

              <textarea
                value={response}
                onChange={(e) => {
                  setResponse(e.target.value)
                  if (isAiDrafted && e.target.value !== aiDraft) {
                    setIsAiDrafted(false)
                  }
                }}
                placeholder="Write your response to the author..."
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed mb-3"
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {isAiDrafted ? '✦ Using AI draft — edit freely' : 'Writing manually'}
                </p>
                <button
                  onClick={handleRespond}
                  disabled={isSending || !response.trim()}
                  className="text-sm bg-blue-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isSending ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>

            {/* internal notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                Internal Notes
                <span className="ml-2 text-slate-300 normal-case">(not visible to author)</span>
              </p>

              {ticket.internal_notes && ticket.internal_notes.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {ticket.internal_notes.map((n) => (
                    <div
                      key={n._id}
                      className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-amber-700">{n.admin_name}</p>
                        <p className="text-xs text-amber-500">{formatTime(n.created_at)}</p>
                      </div>
                      <p className="text-sm text-amber-900 leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a private note for the team..."
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-amber-400 transition-colors resize-none mb-3"
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !note.trim()}
                className="text-sm bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-1 flex flex-col gap-4">

            {/* author info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                Author
              </p>
              {author && (
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                    <span className="text-sm font-medium text-blue-700">
                      {author.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{author.name}</p>
                  <p className="text-xs text-slate-400">{author.email}</p>
                  <p className="text-xs text-slate-400">{author.city}</p>
                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <p className="text-xs text-slate-400">
                      {author.books.length} book{author.books.length !== 1 ? 's' : ''} published
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Member since {new Date(author.joined_date).getFullYear()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* book context */}
            {ticket.book_id && author && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                  Book Context
                </p>
                {(() => {
                  const book = author.books.find((b) => b.book_id === ticket.book_id)
                  if (!book) return null
                  return (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-slate-800">{book.title}</p>
                      <p className="text-xs text-slate-400">{book.genre}</p>
                      <div className="pt-2 border-t border-slate-100 mt-1 flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <p className="text-xs text-slate-400">Copies sold</p>
                          <p className="text-xs font-medium text-slate-700">{book.total_copies_sold}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-slate-400">Royalty earned</p>
                          <p className="text-xs font-medium text-slate-700">₹{book.total_royalty_earned.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-slate-400">Royalty pending</p>
                          <p className="text-xs font-medium text-orange-600">₹{book.royalty_pending.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-slate-400">Last payout</p>
                          <p className="text-xs font-medium text-slate-700">
                            {book.last_royalty_payout_date
                              ? new Date(book.last_royalty_payout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* classification override */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                Classification
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Category
                    {ticket.category_overridden && (
                      <span className="ml-2 text-indigo-500">· overridden</span>
                    )}
                  </label>
                  <select
                    value={overrideCategory}
                    onChange={(e) => setOverrideCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 outline-none focus:border-blue-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Priority
                    {ticket.priority_overridden && (
                      <span className="ml-2 text-indigo-500">· overridden</span>
                    )}
                  </label>
                  <select
                    value={overridePriority}
                    onChange={(e) => setOverridePriority(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 outline-none focus:border-blue-400"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleOverride}
                  disabled={isOverriding}
                  className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isOverriding ? 'Saving...' : 'Save Classification'}
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    AI confidence:{' '}
                    <span className="text-slate-600">
                      {ticket.ai_confidence !== null
                        ? `${Math.round(ticket.ai_confidence * 100)}%`
                        : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminTicketDetail