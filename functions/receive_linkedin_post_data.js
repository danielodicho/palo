// Serverless function to handle LinkedIn posts from Zapier
const db = require('./db');

// Debug function to safely log sensitive information
const debugLog = (message, data) => {
  // Mask sensitive data
  const safeData = { ...data };
  console.log(`DEBUG: ${message}`, JSON.stringify(safeData, null, 2));
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    debugLog('Request received', { 
      method: event.httpMethod,
      path: event.path
    });
    
    // POST request to receive LinkedIn post data
    if (event.httpMethod === 'POST') {
      let data;
      try {
        data = JSON.parse(event.body);
      } catch (e) {
        // If parsing fails, try to handle form data
        const params = new URLSearchParams(event.body);
        data = Object.fromEntries(params);
      }
      
      console.log('Received LinkedIn post data:', data);
      
      if (!data.url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Missing required data. URL is required.' 
          })
        };
      }

      // Prepare post data
      const postData = {
        url: String(data.url), // Ensure it's a string
        title: data.title ? String(data.title) : null,
        description: data.description ? String(data.description) : null,
        received_at: new Date().toISOString()
      };
      
      // Save to file-based database
      debugLog('Saving post to file-based database', { postData });
      const savedPost = db.addPost(postData);
      
      if (savedPost) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'LinkedIn post data received and saved successfully',
            post: savedPost
          })
        };
      } else {
        console.error('Failed to save post to database');
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Failed to save post to database'
          })
        };
      }
    }

    // GET request to fetch all LinkedIn posts
    if (event.httpMethod === 'GET') {
      debugLog('Fetching all posts from file-based database', {});
      const posts = db.readPosts();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          posts: posts
        })
      };
    }

    // Return 404 for any other methods
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error processing LinkedIn post data:', error);
    debugLog('General error details', { 
      name: error.name,
      message: error.message
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
