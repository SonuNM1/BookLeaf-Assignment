const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

export default PageLayout

// simple wrapper component used by all pages - keeps consistent padding and background across the app