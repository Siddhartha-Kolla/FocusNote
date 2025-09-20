require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const docsRoutes = require('./routes/docs');
const chatsRoutes = require('./routes/chats');


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/docs', docsRoutes);
app.use('/chats', chatsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FocusNote backend is running' });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FocusNote backend listening on port ${PORT}`);
});
