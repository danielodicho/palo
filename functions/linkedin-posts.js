// Serverless function to handle LinkedIn posts
const fs = require('fs').promises;
const path = require('path');

// In-memory store for posts since we can't rely on the filesystem in production
let linkedinPosts = [];

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    // GET request to fetch all LinkedIn posts
    if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/linkedin-posts') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(linkedinPosts)
      };
    }

    // POST request to receive LinkedIn post data
    if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/linkedin-posts') {
      const data = JSON.parse(event.body);
      
      if (!data.url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'URL is required' })
        };
      }

      // Add timestamp and ID
      const newPost = {
        id: Date.now().toString(),
        url: data.url,
        timestamp: new Date().toISOString()
      };

      // Add to in-memory store
      linkedinPosts.push(newPost);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, post: newPost })
      };
    }

    // Return 404 for any other paths
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
