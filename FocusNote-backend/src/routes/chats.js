const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// create a chat
router.post('/', auth, async (req, res) => {
  const { title, messages } = req.body;
  try {
    const chat = await prisma.chat.create({
      data: {
        user_id: req.user.id,
        title: title || null,
        messages: messages || []
      }
    });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create chat' });
  }
});

// get chat
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const chat = await prisma.chat.findUnique({ where: { id }});
  if (!chat) return res.status(404).json({ error: 'not found' });
  res.json(chat);
});

// get latest chat for user (for review page)
router.get('/latest/review', auth, async (req, res) => {
  try {
    const latestChat = await prisma.chat.findFirst({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        Doc: {
          orderBy: { created_at: 'desc' }
        }
      }
    });
    
    if (!latestChat) {
      return res.status(404).json({ error: 'No chats found' });
    }

    // Parse messages to ensure proper format
    const messages = Array.isArray(latestChat.messages) ? latestChat.messages : [];
    
    // Format response for review page
    const response = {
      chat: {
        id: latestChat.id,
        title: latestChat.title,
        messages: messages,
        created_at: latestChat.created_at
      },
      documents: latestChat.Doc.map(doc => ({
        id: doc.id,
        from_ai: doc.from_ai,
        created_at: doc.created_at,
        // Note: blob data would need special handling in real implementation
        size: doc.blob ? doc.blob.length : 0
      }))
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch latest chat' });
  }
});

// append a message to chat.messages (read-modify-write)
router.patch('/:id/messages', auth, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const chat = await prisma.chat.findUnique({ where: { id }});
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    const msgs = Array.isArray(chat.messages) ? chat.messages : [];
    const newMessage = { id: uuidv4(), timestamp: new Date().toISOString(), ...message };
    msgs.push(newMessage);
    const updated = await prisma.chat.update({ where: { id }, data: { messages: msgs }});
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update messages' });
  }
});

// Send message to AI for review chat
router.post('/:id/ai-response', auth, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // First, add user message to chat
    const chat = await prisma.chat.findUnique({ where: { id }});
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    
    const msgs = Array.isArray(chat.messages) ? chat.messages : [];
    const userMessage = { 
      id: uuidv4(), 
      type: 'user', 
      content: message, 
      timestamp: new Date().toISOString() 
    };
    msgs.push(userMessage);

    // Get recent messages for context (last 10 messages)
    const recentMessages = msgs.slice(-10);
    
    // Call Python API for AI response
    const PYTHON_API_URL = 'http://localhost:8002';
    
    try {
      const aiResponse = await axios.post(`${PYTHON_API_URL}/chat`, {
        message: message,
        context: recentMessages,
        user_id: req.user.id
      }, {
        timeout: 30000
      });

      const aiMessage = {
        id: uuidv4(),
        type: 'ai',
        content: aiResponse.data.response,
        timestamp: new Date().toISOString()
      };
      msgs.push(aiMessage);

    } catch (aiError) {
      console.error('AI API error:', aiError);
      // Fallback response if AI service is unavailable
      const fallbackMessage = {
        id: uuidv4(),
        type: 'ai',
        content: "I'm currently having trouble processing your request. Please try again in a moment, or feel free to ask a different question about your document.",
        timestamp: new Date().toISOString()
      };
      msgs.push(fallbackMessage);
    }

    // Update chat with both messages
    const updated = await prisma.chat.update({ 
      where: { id }, 
      data: { messages: msgs }
    });
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to process AI response' });
  }
});

module.exports = router;
