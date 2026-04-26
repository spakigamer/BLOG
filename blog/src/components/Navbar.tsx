import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = 'Viewer'
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (userData) {
      role = userData.role
    }
  }

  return (
    <header className="navbar glass">
      <div className="container navbar-container">
        <Link href="/" className="nav-brand">AIBlog</Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          {user ? (
            <>
              {(role === 'Author' || role === 'Admin') && (
                <Link href="/create" className="btn btn-primary">Create Post</Link>
              )}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Role: {role}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Log In</Link>
              <Link href="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
