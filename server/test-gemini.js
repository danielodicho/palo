require('dotenv').config();

// Set API key directly for testing

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Simple test script to verify Gemini API connectivity
async function testGeminiAPI() {
  try {
    // Check if API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY environment variable is not set');
      console.log('Please create a .env file with your Gemini API key');
      return;
    }

    console.log('API Key found, testing connection to Gemini API...');
    
    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro-preview-03-25",
    });
    
    // Generate a simple response
    const prompt = "Write a short greeting message";
    console.log(`Sending prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nResponse from Gemini API:');
    console.log('------------------------');
    console.log(text);
    console.log('------------------------');
    console.log('\nGemini API connection successful!');
    
  } catch (error) {
    console.error('Error connecting to Gemini API:', error.message);
    if (error.message.includes('API key')) {
      console.log('Please check that your API key is valid.');
    }
  }
}

// Run the test
testGeminiAPI();
