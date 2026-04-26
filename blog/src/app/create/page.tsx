'use client'

import { Suspense } from 'react'
import { createPost } from './actions'
import { useSearchParams } from 'next/navigation'

function CreatePostForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }} className="glass">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Create New Post</h1>
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
        
        <form action={createPost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="title">Title</label>
            <input className="form-input" id="title" name="title" type="text" required placeholder="Enter post title" />
          </div>
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="image_url">Featured Image URL</label>
            <input className="form-input" id="image_url" name="image_url" type="url" placeholder="https://example.com/image.png" />
          </div>
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="body">Body Content</label>
            <textarea 
              className="form-input" 
              id="body" 
              name="body" 
              required 
              rows={15} 
              placeholder="Write your post content here..."
              style={{ resize: 'vertical' }}
            />
          </div>
          
          <button className="btn btn-primary" type="submit" style={{ padding: '1rem', fontSize: '1rem' }}>
            Publish Post & Generate Summary
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading form...</div>}>
      <CreatePostForm />
    </Suspense>
  )
}
