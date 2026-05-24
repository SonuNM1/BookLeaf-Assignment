import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.js'

const images = [
  '/bookleaf1.avif',
  '/bookleaf4.avif',
  '/bookleaf5.avif',
  '/bookleaf6.avif',
]

const Login = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (user) {
  return (
    <Navigate
      to={user.role === 'admin' ? '/admin/tickets' : '/author/dashboard'}
      replace
    />
  )
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* left panel */}

      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
        style={{ backgroundColor: '#0F172A' }}
      >

        {/* image grid — 2 cols 4 rows = all 8 images visible */}

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
          {images.map((src, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* light overlay — just enough for text to read, no blue tint */}

        <div
          className="absolute inset-0"
          style={{ background: 'rgba(10,20,40,0.35)' }}
        />

        {/* content above overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">

          {/* logo */}
          <div>
            <h1
              className="text-2xl font-medium text-white"
              style={{ fontFamily: 'Lora, serif' }}
            >
              BookLeaf
            </h1>
            <p
              className="text-xs mt-1 tracking-widest uppercase"
              style={{ color: '#93C5FD' }}
            >
              Publishing
            </p>
          </div>

          {/* stats row at bottom */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xl font-medium text-white">22,000+</p>
              <p className="text-xs mt-0.5" style={{ color: '#BFDBFE' }}>
                Titles published
              </p>
            </div>
            <div
              className="w-px h-8"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            />
            <div>
              <p className="text-xl font-medium text-white">5,000+</p>
              <p className="text-xs mt-0.5" style={{ color: '#BFDBFE' }}>
                Authors
              </p>
            </div>
            <div
              className="w-px h-8"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            />
            <div>
              <p className="text-xl font-medium text-white">India & US</p>
              <p className="text-xs mt-0.5" style={{ color: '#BFDBFE' }}>
                Markets
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* right panel — login form */}

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">

          {/* mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1
              className="text-2xl font-medium text-blue-800"
              style={{ fontFamily: 'Lora, serif' }}
            >
              BookLeaf
            </h1>
          </div>

          {/* heading */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-2">
              Welcome back
            </p>
            <h2
              className="text-2xl font-medium text-slate-800 mb-1"
              style={{ fontFamily: 'Lora, serif' }}
            >
              Sign in to BookLeaf
            </h2>
            <p className="text-sm text-slate-400">
              Your publishing portal — authors & team
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 cursor-pointer rounded-lg text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* test credentials */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-medium text-blue-700 mb-1.5">
              Test credentials
            </p>
            <p className="text-xs text-slate-500 mb-1">
              Author — priya.sharma@email.com / password123
            </p>
            <p className="text-xs text-slate-500">
              Admin — admin@bookleaf.com / admin123
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login