import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.js'

const Navbar = () => {
  const { user, author, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // checks if current path matches link
  const isActive = (path: string) => location.pathname === path

  const linkStyle = (path: string) => ({
    fontSize: '13px',
    color: isActive(path) ? 'var(--primary)' : 'var(--ink-mid)',
    fontWeight: isActive(path) ? 500 : 400,
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: isActive(path) ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'all 0.15s',
  })

  return (
    <nav style={{
      background: 'white',
      borderBottom: '0.5px solid var(--border-subtle)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>

      {/* logo */}
      <Link
        to="/"
        style={{
          fontFamily: 'Lora, serif',
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--primary)',
          textDecoration: 'none',
        }}
      >
        BookLeaf
      </Link>

      {/* nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

        {user?.role === 'author' && (
          <>
            <Link to="/author/dashboard" style={linkStyle('/author/dashboard')}>
              Dashboard
            </Link>
            <Link to="/author/books" style={linkStyle('/author/books')}>
              My Books
            </Link>
            <Link to="/author/tickets" style={linkStyle('/author/tickets')}>
              My Tickets
            </Link>
            <Link
              to="/author/tickets/new"
              style={{
                fontSize: '13px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                padding: '7px 16px',
                borderRadius: '7px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              + New Ticket
            </Link>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/tickets" style={linkStyle('/admin/tickets')}>
              Tickets
            </Link>
            <Link to="/admin/authors" style={linkStyle('/admin/authors')}>
              Authors
            </Link>
          </>
        )}

      </div>

      {/* user info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-dark)', margin: 0 }}>
            {author?.name || user?.email}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--ink-light)', margin: 0, textTransform: 'capitalize' }}>
            {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            fontSize: '12px',
            color: 'var(--ink-light)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444'
            e.currentTarget.style.backgroundColor = '#FEF2F2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ink-light)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          Logout
        </button>
      </div>

    </nav>
  )
}

export default Navbar