const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const geminiRouter = require('./gemini-api');
const draftsRouter = require('./drafts-api');
const postsRouter = require('./posts-api');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
}));

// Routes
app.use('/api/gemini', geminiRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/posts', postsRouter);

// Start server
app.listen(port, () => {
  console.log('Environment variables loaded from .env file');
  console.log('Starting server with environment variables...');
  console.log(`Server running on port ${port}`);
  console.log(`Posts API endpoint: http://localhost:${port}/api/posts`);
  console.log(`Gemini API endpoint: http://localhost:${port}/api/gemini`);
  console.log(`Drafts API endpoint: http://localhost:${port}/api/drafts`);
});
