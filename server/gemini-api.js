// Gemini API integration for the draft editor
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const express = require("express");

const router = express.Router();

// Load training data
const loadTrainingData = () => {
  const trainingDataPath = path.join(__dirname, '..', 'training_data_linkedin_gemini.jsonl');
  try {
    const data = fs.readFileSync(trainingDataPath, 'utf8');
    return data.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (error) {
    console.error("Error loading training data:", error);
    return [];
  }
};

// Initialize Gemini API with environment variable
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  console.log("Using Gemini API key: [MASKED]");
  return {
    genAI: new GoogleGenerativeAI(apiKey)
  };
};

/**
 * Uploads a file to Gemini API
 */
async function uploadFile(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const mimeType = mime.lookup(filePath) || "application/octet-stream";
    
    return {
      data: fileData.toString('base64'),
      mimeType: mimeType,
      displayName: path.basename(filePath),
      uri: path.basename(filePath)
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

/**
 * Generates content using Gemini API
 */
async function generateContent(prompt, files = [], history = []) {
  try {
    const { genAI } = getGeminiClient();
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    
    const generationConfig = {
      temperature: 0.9,  // Slightly lower to maintain consistency with training data
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Load training data context
    const trainingData = loadTrainingData();
    
    // Prepare context prompt
    const contextPrompt = `CONTEXT
You have access to a fine-tuning dataset containing ${trainingData.length} of my previous LinkedIn posts. You must write in my exact style.

WRITING STYLE RULES:
1. Write ONE single post - never provide multiple options
2. Keep it concise and authentic - no corporate jargon
3. Use short paragraphs (1-2 sentences max)
4. Start with a hook or personal story
5. Use ellipses (...) for dramatic pauses
6. Include 1-2 emojis maximum, and only if relevant
7. Add a P.S. section at the end if appropriate
8. End with 3-5 relevant hashtags
9. Never use bold text or formatting
10. Never include "Image:" or formatting instructions
11. Never explain or justify the writing choices

EXAMPLES FROM MY POSTS:

Example 1:
When I applied to over 150 internships in college, I noticed one thing: 

Certain job applications took WAY longer to fill out than others (*cough* Workday)

While some applications only took 1-2 minutes to fill out, others took 15-20+ minutes...

Example 2:
Today's my birthday. 

Four years ago, I was 20 and had just dropped out of Stanford.

I was living in a tiny Airbnb in Mountain View and trying to convince myself (and my Asian parents) that starting a company wasn't a terrible idea.

USER PROMPT:
${prompt}

Write a single LinkedIn post in my exact style:`;
    
    // If we have history, use a chat session
    if (history && history.length > 0) {
      const chatSession = model.startChat({
        generationConfig,
        history,
      });
      
      let result;
      if (files && files.length > 0) {
        const parts = [];
        for (const file of files) {
          parts.push({
            inlineData: {
              data: file.data,
              mimeType: file.mimeType
            }
          });
        }
        parts.push({ text: contextPrompt });
        result = await chatSession.sendMessage(parts);
      } else {
        result = await chatSession.sendMessage(contextPrompt);
      }
      
      return result.response.text();
    } else {
      const parts = [];
      if (files && files.length > 0) {
        for (const file of files) {
          parts.push({
            inlineData: {
              data: file.data,
              mimeType: file.mimeType
            }
          });
        }
      }
      parts.push({ text: contextPrompt });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
      });
      
      return result.response.text();
    }
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

// Route to handle file uploads
router.post("/upload", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }
    
    const uploadedFile = req.files.file;
    const tempPath = path.join(__dirname, "../temp", uploadedFile.name);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Save the file temporarily
    await uploadedFile.mv(tempPath);
    
    // Process the file
    const file = await uploadFile(tempPath);
    
    // Clean up temp file
    fs.unlinkSync(tempPath);
    
    res.json({ 
      success: true, 
      file: {
        displayName: file.displayName,
        mimeType: file.mimeType,
        uri: file.uri,
        data: file.data
      } 
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to generate content
router.post("/generate", async (req, res) => {
  try {
    const { prompt, files, history } = req.body;
    
    if (!prompt && (!files || files.length === 0)) {
      return res.status(400).json({ error: "Prompt or files are required" });
    }
    
    const content = await generateContent(prompt, files, history);
    res.json({ success: true, content });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
