// Simple JSON database for Netlify functions
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get a writable directory in the serverless environment
const DB_DIR = path.join(os.tmpdir(), 'netlify-db');
const POSTS_FILE = path.join(DB_DIR, 'linkedin-posts.json');

// Ensure the database directory exists
const ensureDbDir = () => {
  if (!fs.existsSync(DB_DIR)) {
    try {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log(`Created database directory: ${DB_DIR}`);
    } catch (err) {
      console.error(`Failed to create database directory: ${err.message}`);
    }
  }
};

// Initialize the database file if it doesn't exist
const initDb = () => {
  ensureDbDir();
  if (!fs.existsSync(POSTS_FILE)) {
    try {
      fs.writeFileSync(POSTS_FILE, JSON.stringify([]));
      console.log(`Initialized database file: ${POSTS_FILE}`);
    } catch (err) {
      console.error(`Failed to initialize database file: ${err.message}`);
    }
  }
};

// Read all posts from the database
const readPosts = () => {
  initDb();
  try {
    const data = fs.readFileSync(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading from database: ${err.message}`);
    return [];
  }
};

// Write posts to the database
const writePosts = (posts) => {
  initDb();
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing to database: ${err.message}`);
    return false;
  }
};

// Add a new post to the database
const addPost = (post) => {
  const posts = readPosts();
  const newPost = {
    ...post,
    id: Date.now().toString()
  };
  posts.push(newPost);
  const success = writePosts(posts);
  return success ? newPost : null;
};

// Get a post by ID
const getPostById = (id) => {
  const posts = readPosts();
  return posts.find(post => post.id === id) || null;
};

module.exports = {
  readPosts,
  addPost,
  getPostById
};
