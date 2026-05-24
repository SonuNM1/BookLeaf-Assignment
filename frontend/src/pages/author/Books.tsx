import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Layout from '../../components/shared/Layout.js'
import api from '../../services/api.js'
import type { Book } from '../../types/index.js'

const getStatusStyle = (status: string) => {
  if (status === 'Published & Live') return 'bg-green-100 text-green-700'
  if (status.includes('Production')) return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-500'
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/authors/me/books')
        setBooks(res.data.data.books)
      } catch {
        toast.error('Failed to load books')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBooks()
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-9">

        <div className="mb-7 pb-5 border-b border-slate-200">
          <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
            Library
          </p>
          <h1
            className="text-2xl font-medium text-slate-800"
            style={{ fontFamily: 'Lora, serif' }}
          >
            My Books
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            All your published and in-production titles
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400">Loading your books...</p>
          </div>
        )}

        {!isLoading && books.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm text-slate-400">No books found</p>
          </div>
        )}

        {!isLoading && books.length > 0 && (
          <div className="flex flex-col gap-4">
            {books.map((book) => (
              <div
                key={book.book_id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-medium text-slate-800 mb-1">
                      {book.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {book.genre} · ISBN: {book.isbn}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${getStatusStyle(book.status)}`}>
                    {book.status}
                  </span>
                </div>

                {book.status === 'Published & Live' && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">MRP</p>
                      <p className="text-sm font-medium text-slate-700">₹{book.mrp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Copies Sold</p>
                      <p className="text-sm font-medium text-slate-700">
                        {book.total_copies_sold.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Royalty Earned</p>
                      <p className="text-sm font-medium text-green-600">
                        ₹{book.total_royalty_earned.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Royalty Pending</p>
                      <p className={`text-sm font-medium ${book.royalty_pending > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                        {book.royalty_pending > 0
                          ? `₹${book.royalty_pending.toLocaleString()}`
                          : 'All paid'}
                      </p>
                    </div>
                  </div>
                )}

                {book.status !== 'Published & Live' && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-yellow-600">
                      📋 This book is currently in production. Sales data will appear once published.
                    </p>
                  </div>
                )}

                {book.available_on.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {book.available_on.map((platform) => (
                      <span
                        key={platform}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}

export default Books