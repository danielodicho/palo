require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const FormData = require('form-data');

// Sample file path
const sampleFilePath = path.join(__dirname, 'sample.txt');
const outputFilePath = path.join(__dirname, 'output.json');

async function testOpenAIWithFile() {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Error: OPENAI_API_KEY environment variable not found.");
      console.error("Make sure you have a .env file with OPENAI_API_KEY=your-api-key");
      return;
    }

    console.log(`Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Check if sample file exists
    if (!fs.existsSync(sampleFilePath)) {
      console.log(`Error: Sample file '${sampleFilePath}' not found.`);
      console.log("Creating a sample.txt file for testing...");
      
      const sampleContent = `This is a sample text file for testing OpenAI file attachments.
The OpenAI API can process this file and generate insights based on its content.
Please analyze this text and provide suggestions for improvement.`;
      
      fs.writeFileSync(sampleFilePath, sampleContent, 'utf8');
      console.log(`Created sample file: ${sampleFilePath}`);
    }
    
    console.log(`Reading input file: ${sampleFilePath}`);
    const fileContent = fs.readFileSync(sampleFilePath, 'utf8');
    console.log(`File size: ${fileContent.length} characters`);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Method 1: Using the OpenAI SDK to upload file
    console.log("Uploading file to OpenAI...");
    const file = await openai.files.create({
      file: fs.createReadStream(sampleFilePath),
      purpose: "assistants",
    });
    
    console.log(`File uploaded successfully with ID: ${file.id}`);

    // Create a chat completion with the file attachment
    console.log("Creating chat completion with file attachment...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an assistant that analyzes HTML content and provides SEO improvement suggestions."
        },
        { 
          role: "user", 
          content: [
            {
              type: "text", 
              text: "Please analyze the attached HTML file and provide 3 key SEO improvement suggestions in JSON format."
            },
            {
              type: "file",
              file_id: file.id
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Process the response
    const content = completion.choices[0].message.content;
    console.log("\nResponse from OpenAI:");
    console.log(content);

    // Save the response to a JSON file
    try {
      // Try to parse as JSON
      const jsonContent = JSON.parse(content);
      fs.writeFileSync(outputFilePath, JSON.stringify(jsonContent, null, 2));
    } catch (jsonError) {
      // If not valid JSON, save as is
      fs.writeFileSync(outputFilePath, content);
    }

    console.log(`\nResponse saved to: ${outputFilePath}`);

    // Clean up - delete the file from OpenAI
    try {
      await openai.files.del(file.id);
      console.log(`File ${file.id} deleted from OpenAI`);
    } catch (deleteError) {
      console.error(`Error deleting file from OpenAI: ${deleteError.message}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
  }
}

// Run the test
testOpenAIWithFile();
