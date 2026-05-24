import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Layout from '../../components/shared/Layout.js'
import api from '../../services/api.js'
import type { Author } from '../../types/index.js'

const Authors = () => {
  const [authors, setAuthors] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await api.get('/admin/authors')
        setAuthors(res.data.data.authors)
      } catch {
        toast.error('Failed to load authors')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAuthors()
  }, [])

  const fetchAuthorDetail = async (author_id: string) => {
    try {
      const res = await api.get(`/admin/authors/${author_id}`)
      setSelectedAuthor(res.data.data.author)
    } catch {
      toast.error('Failed to load author details')
    }
  }

  return (
    <Layout>

      <div className="max-w-6xl mx-auto px-6 py-9">

        {/* header */}
        <div className="mb-7 pb-5 border-b border-slate-200">
          <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
            Admin
          </p>
          <h1
            className="text-2xl font-medium text-slate-800"
            style={{ fontFamily: 'Lora, serif' }}
          >
            Authors
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* authors list */}
          <div className="col-span-1">
            {isLoading && (
              <p className="text-sm text-slate-400 text-center py-10">
                Loading authors...
              </p>
            )}

            {!isLoading && (
              <div className="flex flex-col gap-2">
                {authors.map((author) => (
                  <button
                    key={author.author_id}
                    onClick={() => fetchAuthorDetail(author.author_id)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      selectedAuthor?.author_id === author.author_id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-blue-700">
                          {author.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {author.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {author.city}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* author detail */}
          <div className="col-span-2">
            {!selectedAuthor && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-sm text-slate-400">
                  Select an author to view their details
                </p>
              </div>
            )}

            {selectedAuthor && (
              <div className="flex flex-col gap-4">

                {/* author info card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {selectedAuthor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2
                        className="text-lg font-medium text-slate-800"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {selectedAuthor.name}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {selectedAuthor.author_id} · {selectedAuthor.city}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Email</p>
                      <p className="text-sm text-slate-700">{selectedAuthor.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                      <p className="text-sm text-slate-700">{selectedAuthor.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Joined</p>
                      <p className="text-sm text-slate-700">
                        {new Date(selectedAuthor.joined_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Total Books</p>
                      <p className="text-sm text-slate-700">{selectedAuthor.books.length}</p>
                    </div>
                  </div>
                </div>

                {/* books */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                    Books
                  </p>
                  <div className="flex flex-col gap-3">
                    {selectedAuthor.books.map((book) => (
                      <div
                        key={book.book_id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {book.genre} · {book.book_id}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            book.status === 'Published & Live'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {book.status}
                          </span>
                        </div>

                        {book.status === 'Published & Live' && (
                          <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-200 mt-2">
                            <div>
                              <p className="text-xs text-slate-400">Copies</p>
                              <p className="text-xs font-medium text-slate-700 mt-0.5">
                                {book.total_copies_sold}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Earned</p>
                              <p className="text-xs font-medium text-green-600 mt-0.5">
                                ₹{book.total_royalty_earned.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Paid</p>
                              <p className="text-xs font-medium text-slate-700 mt-0.5">
                                ₹{book.royalty_paid.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Pending</p>
                              <p className="text-xs font-medium text-orange-600 mt-0.5">
                                ₹{book.royalty_pending.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      </Layout>
  )
}

export default Authors