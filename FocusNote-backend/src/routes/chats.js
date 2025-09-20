const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

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

module.exports = router;
