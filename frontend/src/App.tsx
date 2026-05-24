import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.js'

const Login = lazy(() => import('./pages/Login.js'))

const AuthorDashboard = lazy(() => import('./pages/author/Dashboard.js'))
const AuthorBooks = lazy(() => import('./pages/author/Books.js'))
const AuthorTickets = lazy(() => import('./pages/author/Tickets.js'))
const AuthorSubmitTicket = lazy(() => import('./pages/author/SubmitTicket.js'))
const AuthorTicketDetail = lazy(() => import('./pages/author/TicketDetail.js'))

const AdminTicketQueue = lazy(() => import('./pages/admin/TicketQueue.js'))
const AdminTicketDetail = lazy(() => import('./pages/admin/TicketDetail.js'))
const AdminAuthors = lazy(() => import('./pages/admin/Authors.js'))

// requires login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

// requires specific role
const RoleRoute = ({
  children,
  role,
}: {
  children: React.ReactNode
  role: 'author' | 'admin'
}) => {
  const { user } = useAuth()

  if (user?.role !== role) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin/tickets' : '/author/dashboard'}
        replace
      />
    )
  }

  return <>{children}</>
}

const App = () => {
  const { user } = useAuth()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      }
    >
      <Routes>

        {/* root redirect */}
        <Route
          path="/"
          element={
            user
              ? user.role === 'admin'
                ? <Navigate to="/admin/tickets" replace />
                : <Navigate to="/author/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* author portal */}
        <Route
          path="/author/*"
          element={
            <ProtectedRoute>
              <RoleRoute role="author">
                <Routes>
                  <Route path="dashboard" element={<AuthorDashboard />} />
                  <Route path="books" element={<AuthorBooks />} />
                  <Route path="tickets/new" element={<AuthorSubmitTicket />} />
                  <Route path="tickets/:id" element={<AuthorTicketDetail />} />
                  <Route path="tickets" element={<AuthorTickets />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* admin portal */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <Routes>
                  <Route path="tickets" element={<AdminTicketQueue />} />
                  <Route path="tickets/:id" element={<AdminTicketDetail />} />
                  <Route path="authors" element={<AdminAuthors />} />
                  <Route path="*" element={<Navigate to="tickets" replace />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  )
}

export default App