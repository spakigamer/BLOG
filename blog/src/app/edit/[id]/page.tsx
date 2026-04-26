import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updatePost } from './actions'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!post) notFound()

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  const role = userData?.role || 'Viewer'
  
  if (role !== 'Admin' && (role !== 'Author' || post.author_id !== user.id)) {
    redirect('/')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }} className="glass">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Edit Post</h1>
        
        <form action={updatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input type="hidden" name="id" value={post.id} />
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="title">Title</label>
            <input className="form-input" id="title" name="title" type="text" required defaultValue={post.title} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="image_url">Featured Image URL</label>
            <input className="form-input" id="image_url" name="image_url" type="url" defaultValue={post.image_url} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="body">Body Content</label>
            <textarea 
              className="form-input" 
              id="body" 
              name="body" 
              required 
              rows={15} 
              defaultValue={post.body}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="regenerate" name="regenerate" value="true" />
            <label htmlFor="regenerate">Regenerate AI Summary?</label>
          </div>
          
          <button className="btn btn-primary" type="submit" style={{ padding: '1rem', fontSize: '1rem' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
