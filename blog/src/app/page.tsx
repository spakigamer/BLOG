import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home(
  props: { searchParams: Promise<{ query?: string; page?: string }> }
) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const query = searchParams.query || ''
  const page = parseInt(searchParams.page || '1', 10)
  const LIMIT = 6
  
  let supabaseQuery = supabase
    .from('posts')
    .select('*, users!inner(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * LIMIT, page * LIMIT - 1)
    
  if (query) {
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`)
  }

  const { data: posts, count } = await supabaseQuery
  
  const totalPages = count ? Math.ceil(count / LIMIT) : 1

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Latest Posts</h1>
        <form style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            name="query" 
            placeholder="Search posts..." 
            defaultValue={query}
            className="form-input"
            style={{ width: '250px', padding: '0.5rem 1rem' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <div key={post.id} className="card">
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
            )}
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {post.title}
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                By {post.users?.name} • {new Date(post.created_at).toLocaleDateString()}
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', borderLeft: '3px solid var(--accent-color)' }}>
                <strong>AI Summary:</strong> {post.summary || 'No summary available.'}
              </div>
              <Link href={`/post/${post.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {(!posts || posts.length === 0) && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          No posts found.
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          {page > 1 && (
            <Link href={`/?page=${page - 1}${query ? `&query=${query}` : ''}`} className="btn btn-secondary">
              Previous
            </Link>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/?page=${page + 1}${query ? `&query=${query}` : ''}`} className="btn btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
