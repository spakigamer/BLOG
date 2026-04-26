'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenAI } from '@google/genai'

export async function updatePost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const image_url = formData.get('image_url') as string
  const regenerate = formData.get('regenerate') === 'true'

  // Fetch the current post to check permissions and get old summary
  const { data: post } = await supabase.from('posts').select('author_id, summary').eq('id', id).single()
  
  if (!post) {
    redirect(`/?error=Post not found`)
  }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  const role = userData?.role || 'Viewer'

  if (role !== 'Admin' && (role !== 'Author' || post.author_id !== user.id)) {
    redirect(`/?error=Unauthorized to edit this post`)
  }

  let summary = post.summary
  
  if (regenerate && process.env.GOOGLE_AI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
      const prompt = `Write a concise summary of the following blog post in around 200 words. Title: ${title}\n\nContent: ${body}`
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      })
      summary = response.text || summary
    } catch (e) {
      console.error('AI Summary generation failed', e)
    }
  }

  const { error } = await supabase.from('posts').update({
    title,
    body,
    image_url,
    summary,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (error) {
    console.error('Error updating post', error)
    redirect(`/edit/${id}?error=Failed to update post`)
  }

  revalidatePath(`/post/${id}`)
  revalidatePath('/')
  redirect(`/post/${id}`)
}
