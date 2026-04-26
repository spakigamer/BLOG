import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { addComment, deletePost } from './actions'
import Link from 'next/link'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select('*, users!inner(id, name)')
    .eq('id', resolvedParams.id)
    .single()

  if (!post) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, users!inner(name)')
    .eq('post_id', resolvedParams.id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  let role = 'Viewer'
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData) role = userData.role
  }

  const canEditOrDelete = user && (role === 'Admin' || (role === 'Author' && post.author_id === user.id))

  return (
    <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {post.image_url && (
        <img 
          src={post.image_url} 
          alt={post.title} 
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '1rem', marginBottom: '2rem' }} 
        />
      )}
      
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>{post.title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          By <span style={{ color: 'var(--text-primary)' }}>{post.users.name}</span> • {new Date(post.created_at).toLocaleDateString()}
        </div>
        {canEditOrDelete && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href={`/edit/${post.id}`} className="btn btn-secondary">Edit</Link>
            <form action={async () => {
              'use server'
              await deletePost(post.id)
              redirect('/')
            }}>
              <button type="submit" className="btn" style={{ backgroundColor: 'var(--error)', color: 'white' }}>Delete</button>
            </form>
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', borderLeft: '4px solid var(--accent-color)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '0.5rem' }}>AI Summary</h3>
        <p>{post.summary}</p>
      </div>

      <div style={{ fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '4rem', whiteSpace: 'pre-wrap' }}>
        {post.body}
      </div>

      <div id="comments" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Comments ({comments?.length || 0})</h3>
        
        {user ? (
          <form action={addComment} style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="post_id" value={post.id} />
            <textarea 
              name="comment_text" 
              required 
              placeholder="Add a comment..."
              className="form-input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Post Comment</button>
          </form>
        ) : (
          <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '0.5rem', marginBottom: '3rem', textAlign: 'center' }}>
            <Link href="/login" style={{ textDecoration: 'underline' }}>Log in</Link> to add a comment.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments?.map((comment) => (
            <div key={comment.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{comment.users.name}</strong>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p>{comment.comment_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
