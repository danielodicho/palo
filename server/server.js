const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
app.get('/api/linkedin_posts', (req, res) => {
  try {
    const posts = readPosts();
    return res.status(200).json({ 
      success: true, 
      posts 
    });
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`LinkedIn post data endpoint: http://localhost:${PORT}/api/receive_linkedin_post_data`);
});
