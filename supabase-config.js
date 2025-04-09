// Supabase configuration
// This file is for reference only - actual credentials should be set as environment variables in Netlify

// When setting up your Supabase project, you'll need:
// 1. SUPABASE_URL - The URL of your Supabase project
// 2. SUPABASE_KEY - Your Supabase anon/public key

// Example values (replace these with your actual values in Netlify environment variables):
// SUPABASE_URL = "https://xyzproject.supabase.co"
// SUPABASE_KEY = "your-anon-key"

// Table structure for LinkedIn posts:
/*
CREATE TABLE linkedin_posts (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

module.exports = {
  // This is just a placeholder - actual values should be set in Netlify environment variables
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY
};
