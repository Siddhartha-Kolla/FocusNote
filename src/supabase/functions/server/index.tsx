import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Auth endpoints
app.post('/make-server-5ceb8382/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup server error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Save notes
app.post('/make-server-5ceb8382/notes', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { title, content, tags } = await c.req.json()
    const noteId = crypto.randomUUID()
    
    const noteData = {
      id: noteId,
      userId: user.id,
      title,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await kv.set(`notes:${user.id}:${noteId}`, noteData)
    await kv.set(`user:${user.id}:note_ids`, [
      ...(await kv.get(`user:${user.id}:note_ids`) || []),
      noteId
    ])

    return c.json({ note: noteData })
  } catch (error) {
    console.log('Save notes error:', error)
    return c.json({ error: 'Failed to save notes' }, 500)
  }
})

// Get user's notes
app.get('/make-server-5ceb8382/notes', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const noteIds = await kv.get(`user:${user.id}:note_ids`) || []
    const noteKeys = noteIds.map(id => `notes:${user.id}:${id}`)
    const notes = await kv.mget(noteKeys)

    return c.json({ notes: notes.filter(Boolean) })
  } catch (error) {
    console.log('Get notes error:', error)
    return c.json({ error: 'Failed to retrieve notes' }, 500)
  }
})

// Save exam results
app.post('/make-server-5ceb8382/exam-results', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { noteId, questions, answers, score, percentage } = await c.req.json()
    const resultId = crypto.randomUUID()
    
    const resultData = {
      id: resultId,
      userId: user.id,
      noteId,
      questions,
      answers,
      score,
      percentage,
      completedAt: new Date().toISOString()
    }

    await kv.set(`exam_results:${user.id}:${resultId}`, resultData)
    await kv.set(`user:${user.id}:exam_result_ids`, [
      ...(await kv.get(`user:${user.id}:exam_result_ids`) || []),
      resultId
    ])

    return c.json({ result: resultData })
  } catch (error) {
    console.log('Save exam results error:', error)
    return c.json({ error: 'Failed to save exam results' }, 500)
  }
})

// Get exam history
app.get('/make-server-5ceb8382/exam-history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const resultIds = await kv.get(`user:${user.id}:exam_result_ids`) || []
    const resultKeys = resultIds.map(id => `exam_results:${user.id}:${id}`)
    const results = await kv.mget(resultKeys)

    return c.json({ results: results.filter(Boolean).sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ) })
  } catch (error) {
    console.log('Get exam history error:', error)
    return c.json({ error: 'Failed to retrieve exam history' }, 500)
  }
})

// Delete note
app.delete('/make-server-5ceb8382/notes/:noteId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const noteId = c.req.param('noteId')
    
    await kv.del(`notes:${user.id}:${noteId}`)
    
    const noteIds = await kv.get(`user:${user.id}:note_ids`) || []
    const updatedIds = noteIds.filter(id => id !== noteId)
    await kv.set(`user:${user.id}:note_ids`, updatedIds)

    return c.json({ success: true })
  } catch (error) {
    console.log('Delete note error:', error)
    return c.json({ error: 'Failed to delete note' }, 500)
  }
})

// Process PDF upload and extract text
app.post('/make-server-5ceb8382/process-pdf', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Create storage bucket if it doesn't exist
    const bucketName = 'make-5ceb8382-pdfs'
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false })
    }

    const formData = await c.req.formData()
    const pdfFile = formData.get('pdf') as File
    
    if (!pdfFile) {
      return c.json({ error: 'No PDF file provided' }, 400)
    }

    // Upload PDF to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${pdfFile.name}`
    const pdfArrayBuffer = await pdfFile.arrayBuffer()
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfArrayBuffer, {
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.log('PDF upload error:', uploadError)
      return c.json({ error: 'Failed to upload PDF' }, 500)
    }

    // Extract text from PDF using pdf-parse
    let extractedText = ''
    try {
      const { default: pdfParse } = await import('npm:pdf-parse@1.1.1')
      const pdfData = await pdfParse(new Uint8Array(pdfArrayBuffer))
      extractedText = pdfData.text
    } catch (parseError) {
      console.log('PDF parsing error:', parseError)
      return c.json({ error: 'Failed to extract text from PDF' }, 500)
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return c.json({ error: 'No text could be extracted from the PDF' }, 400)
    }

    // Clean up extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n')  // Clean up multiple newlines
      .trim()

    return c.json({ 
      extractedText: cleanedText,
      fileName: pdfFile.name,
      textLength: cleanedText.length
    })

  } catch (error) {
    console.log('PDF processing server error:', error)
    return c.json({ error: 'Internal server error during PDF processing' }, 500)
  }
})

Deno.serve(app.fetch)