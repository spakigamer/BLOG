'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const postId = formData.get('post_id') as string
  const commentText = formData.get('comment_text') as string

  if (!postId || !commentText) throw new Error('Invalid data')

  await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    comment_text: commentText
  })

  revalidatePath(`/post/${postId}`)
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/')
}
