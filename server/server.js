const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const geminiRouter = require('./gemini-api');
const draftsRouter = require('./drafts-api');
const postsRouter = require('./posts-api');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

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

// Create a data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// File to store LinkedIn post data
const linkedInPostsFile = path.join(dataDir, 'linkedin_posts.json');

// Initialize the posts file if it doesn't exist
if (!fs.existsSync(linkedInPostsFile)) {
  fs.writeFileSync(linkedInPostsFile, JSON.stringify([], null, 2));
}

// Helper function to read posts
const readPosts = () => {
  try {
    const data = fs.readFileSync(linkedInPostsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading posts file:', error);
    return [];
  }
};

// Helper function to write posts
const writePosts = (posts) => {
  try {
    fs.writeFileSync(linkedInPostsFile, JSON.stringify(posts, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to posts file:', error);
    return false;
  }
};

// Routes
app.use('/api/gemini', geminiRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/posts', postsRouter);

// API endpoint to receive LinkedIn post data from Zapier
app.post('/api/receive_linkedin_post_data', (req, res) => {
  try {
    const postData = req.body;
    console.log('Received LinkedIn post data:', postData);
    
    // Validate the incoming data
    if (!postData || !postData.url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required data. URL is required.' 
      });
    }
    
    // Add timestamp
    const newPost = {
      ...postData,
      receivedAt: new Date().toISOString()
    };
    
    // Read existing posts
    const posts = readPosts();
    
    // Add the new post
    posts.push(newPost);
    
    // Save the updated posts
    if (writePosts(posts)) {
      return res.status(200).json({ 
        success: true, 
        message: 'LinkedIn post data received and saved successfully',
        post: newPost
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save post data' 
      });
    }
  } catch (error) {
    console.error('Error processing LinkedIn post data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// API endpoint to get all LinkedIn posts
app.get('/api/linkedin_posts', async (req, res) => {
  try {
    const useApify = req.query.useApify === 'true';
    
    if (useApify) {
      // Use the apify service to get fresh posts
      const apifyService = require('./apify-service');
      const freshPosts = await apifyService.getLinkedInPosts();
      
      // Save the fresh posts to our local storage
      savePosts(freshPosts);
      
      return res.status(200).json({
        success: true,
        posts: freshPosts
      });
    } else {
      // Use cached posts
      const posts = readPosts();
      return res.status(200).json({ 
        success: true, 
        posts 
      });
    }
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// API endpoint to fetch content from a LinkedIn post URL
app.post('/api/fetch-post-content', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // Use axios to fetch the content
    const axios = require('axios');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Extract just the main content from the page
    // This is a simple extraction - you might want to use a more sophisticated approach
    const cheerio = require('cheerio');
    const $ = cheerio.load(response.data);
    
    // Extract the main post content
    const postContent = $('.feed-shared-update-v2__description').html() || 
                       $('.feed-shared-inline-show-more-text').html() || 
                       $('.update-components-text').html();
    
    return res.status(200).json({
      success: true,
      content: postContent || '<p>Content could not be extracted</p>'
    });
  } catch (error) {
    console.error('Error fetching post content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch post content',
      error: error.message
    });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log('Environment variables loaded from .env file');
  console.log('Starting server with environment variables...');
  console.log(`Server running on port ${port}`);
  console.log(`Posts API endpoint: http://localhost:${port}/api/posts`);
  console.log(`Gemini API endpoint: http://localhost:${port}/api/gemini`);
  console.log(`Drafts API endpoint: http://localhost:${port}/api/drafts`);
  console.log(`LinkedIn post data endpoint: http://localhost:${port}/api/receive_linkedin_post_data`);
  console.log(`LinkedIn posts endpoint: http://localhost:${port}/api/linkedin_posts`);
});
