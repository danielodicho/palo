// Serverless function to handle LinkedIn posts from Zapier
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Function to create Supabase client
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  }
  
  // Ensure URL has https:// prefix
  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://' + supabaseUrl;
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl);
  return createClient(supabaseUrl, supabaseKey);
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
    const supabase = getSupabaseClient();
    
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

      // Prepare post data - store URL as text string without validation
      const postData = {
        url: String(data.url), // Ensure it's a string
        title: data.title ? String(data.title) : null,
        description: data.description ? String(data.description) : null,
        received_at: new Date().toISOString()
      };
      
      try {
        // Insert into Supabase
        const { data: insertedData, error } = await supabase
          .from('linkedin_posts')
          .insert([postData])
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'LinkedIn post data received and saved successfully',
            post: insertedData[0]
          })
        };
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Failed to save to database',
            error: dbError.message
          })
        };
      }
    }

    // Return 404 for any other methods
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error processing LinkedIn post data:', error);
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
