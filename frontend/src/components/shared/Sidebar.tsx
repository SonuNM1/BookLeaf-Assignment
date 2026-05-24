import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.js'
import {
  RiDashboardLine,
  RiBookLine,
  RiTicketLine,
  RiAddLine,
  RiTeamLine,
  RiUserLine,
  RiLogoutBoxLine,
} from 'react-icons/ri'

const Sidebar = () => {
  const { user, author, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // active link style
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col">

      {/* logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <h1
          className="text-lg font-medium text-blue-800"
          style={{ fontFamily: 'Lora, serif' }}
        >
          BookLeaf
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {user?.role === 'admin' ? 'Admin Portal' : 'Author Portal'}
        </p>
      </div>

      {/* nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">

        {user?.role === 'author' && (
          <>
            <NavLink to="/author/dashboard" className={linkClass}>
              <RiDashboardLine size={16} />
              Dashboard
            </NavLink>
            <NavLink to="/author/books" className={linkClass}>
              <RiBookLine size={16} />
              My Books
            </NavLink>
            <NavLink to="/author/tickets" className={linkClass} end>
              <RiTicketLine size={16} />
              My Tickets
            </NavLink>

            {/* divider */}
            <div className="my-2 border-t border-slate-100" />

            <NavLink to="/author/tickets/new" className={linkClass}>
              <RiAddLine size={16} />
              New Ticket
            </NavLink>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin/tickets" className={linkClass} end>
              <RiTicketLine size={16} />
              Ticket Queue
            </NavLink>
            <NavLink to="/admin/authors" className={linkClass}>
              <RiTeamLine size={16} />
              Authors
            </NavLink>
          </>
        )}

      </nav>

      {/* user profile at bottom */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          {/* avatar circle */}
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <RiUserLine size={14} className="text-blue-700" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              {author?.name || user?.email}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors w-full px-1 py-1 rounded cursor-pointer"
        >
          <RiLogoutBoxLine size={14} />
          Logout
        </button>
      </div>

    </aside>
  )
}

export default Sidebar