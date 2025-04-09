// Script to start the server with environment variables
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Function to prompt for API key
async function promptForApiKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Please enter your Gemini API key: ', (apiKey) => {
      rl.close();
      resolve(apiKey.trim());
    });
  });
}

// Function to read .env file
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n');
      
      // Parse each line and set environment variables
      envVars.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
      
      console.log('Environment variables loaded from .env file');
      return true;
    } else {
      console.log('No .env file found, will prompt for API key');
      return false;
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
    return false;
  }
}

// Main function to start the server
async function startServer() {
  // Try to load from .env file first
  loadEnv();
  
  // If API key is not set, prompt for it
  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY not found in environment variables');
    const apiKey = await promptForApiKey();
    
    if (!apiKey) {
      console.error('No API key provided. Cannot start server.');
      process.exit(1);
    }
    
    process.env.GEMINI_API_KEY = apiKey;
    console.log('API key set from user input');
  }
  
  // Start the server
  console.log('Starting server with environment variables...');
  const serverProcess = spawn('node', ['server/server.js'], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

// Run the start server function
startServer();
