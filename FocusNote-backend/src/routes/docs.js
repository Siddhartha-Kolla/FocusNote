const express = require('express');
const router = express.Router();
const multer = require('multer');
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload a document (stores binary blob in DB)
router.post('/', auth, upload.single('file'), async (req, res) => {
  const file = req.file;
  const { chat_id, author } = req.body;

  if (!file) return res.status(400).json({ error: 'file required' });
  if (!chat_id) return res.status(400).json({ error: 'chat_id required' });
  if (!author) return res.status(400).json({ error: 'author required (user|ai)' });

  try {
    const doc = await prisma.doc.create({
      data: {
        user_id: req.user.id,
        chat_id,
        author,
        blob: file.buffer,
      },
    });
    res.json({ docId: doc.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save file' });
  }
});

// Download a document
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const doc = await prisma.doc.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ error: 'not found' });

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
  res.send(doc.blob);
});

module.exports = router;
