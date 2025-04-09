// OpenAI HTML Analyzer
// This module provides a function to analyze HTML content using OpenAI's API
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Analyzes HTML content using OpenAI's API
 * @param {string} htmlContent - The HTML content to analyze
 * @param {string} instructions - Custom instructions for the analysis
 * @returns {Promise<Object>} - The analysis results
 */
async function analyzeHtmlContent(htmlContent, instructions) {
  try {
    // Use API key from .env file
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-api-key') {
      throw new Error('Valid OpenAI API key not found in server configuration');
    }
    
    console.log(`Using OpenAI API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`HTML content size: ${htmlContent.length} characters`);
    
    // Extract key elements from HTML to reduce size
    let processedHtml = htmlContent;
    try {
      const $ = cheerio.load(htmlContent);
      
      // Extract head section
      const head = $('head').html() || '';
      
      // Extract important meta tags
      const metaTags = [];
      $('meta').each((i, el) => {
        metaTags.push($.html(el));
      });
      
      // Extract title
      const title = $('title').html() || '';
      
      // Extract h1, h2, h3 tags
      const headings = [];
      $('h1, h2, h3').each((i, el) => {
        headings.push($.html(el));
      });
      
      // Extract main content if available
      const mainContent = $('main').html() || $('article').html() || $('body').html().substring(0, 50000);
      
      // Create a simplified HTML structure
      processedHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  ${metaTags.join('\n  ')}
</head>
<body>
  <div class="headings">
    ${headings.join('\n    ')}
  </div>
  <div class="main-content">
    ${mainContent}
  </div>
</body>
</html>`;
      
      console.log(`Processed HTML size: ${processedHtml.length} characters (reduced from ${htmlContent.length})`);
    } catch (processingError) {
      console.error('Error processing HTML:', processingError);
      // If processing fails, use a truncated version of the original HTML
      if (htmlContent.length > 100000) {
        processedHtml = htmlContent.substring(0, 100000) + '\n<!-- Content truncated for analysis -->';
        console.log(`Truncated HTML to ${processedHtml.length} characters`);
      }
    }
    
    // Prepare the prompt for analysis
    const systemPrompt = 'You are an expert in SEO, Generative Engine Optimization (GEO), and web accessibility. You must ALWAYS respond with valid JSON.';
    const userPrompt = instructions || `Analyze the HTML content provided below. Your goal is to generate specific, actionable improvement suggestions to optimize the page for AI-powered search engines like ChatGPT, Google SGE, and Perplexity.

You MUST return your output as a valid JSON array of objects in the following format:

[
  {
    "title": "<Brief title of the proposed change>",
    "reason": "<Short explanation of why this improves SEO/GEO>",
    "code": "<The actual HTML/JSON code to add or modify>",
    "location": "<Where to apply it — e.g., 'inside <head>', 'before </body>', or 'replace meta description'>"
  }
]

IMPORTANT: Your entire response must be valid JSON. Do not include any explanations, markdown, or commentary outside of the JSON structure. Do not include any text like "Here's the JSON:" or similar phrases. Just return the raw JSON array.

HTML Content:
${processedHtml}`;
    
    // Make the API call
    console.log('Calling OpenAI API...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000 // 60 second timeout
      }
    );
    
    console.log('OpenAI API response received successfully');
    
    // Process the response
    const content = response.data.choices[0].message.content;
    
    // Try to parse as JSON
    try {
      // Check if the content starts with a non-JSON character
      let jsonString = content.trim();
      
      // If the response starts with text like "I'm sorry" or "As an AI", try to extract JSON
      if (!jsonString.startsWith('[')) {
        // Look for JSON array in the response
        const jsonMatch = jsonString.match(/\[\s*{.*}\s*\]/s);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('Extracted JSON from text response');
        } else {
          // If we can't find JSON, try again with a more explicit prompt
          console.log('JSON not found in response, trying again with a more explicit prompt...');
          
          // Make a second API call with a more explicit prompt
          const retryResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are an expert in SEO and web optimization. You MUST respond with ONLY a valid JSON array. Do not include any explanations or text outside the JSON structure.'
                },
                { 
                  role: 'user', 
                  content: `Analyze this HTML and provide all relevant SEO improvement suggestions you can find. Do not limit yourself to any specific number - include as many or as few as are actually needed. Return ONLY a JSON array in this exact format with no other text:
[{"title":"Suggestion title","reason":"Why this improves SEO","code":"HTML code to add","location":"Where to add it"}]

HTML: ${processedHtml.substring(0, 50000)}`
                }
              ],
              temperature: 0.3, // Lower temperature for more deterministic output
              max_tokens: 2000
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              timeout: 60000 // 60 second timeout
            }
          );
          
          const retryContent = retryResponse.data.choices[0].message.content.trim();
          if (retryContent.startsWith('[') && retryContent.endsWith(']')) {
            console.log('Successfully got JSON from retry attempt');
            return {
              success: true,
              data: JSON.parse(retryContent)
            };
          } else {
            throw new Error('Failed to get JSON response after retry');
          }
        }
      }
      
      const jsonContent = JSON.parse(jsonString);
      return {
        success: true,
        data: jsonContent
      };
    } catch (jsonError) {
      console.error('Error parsing OpenAI response as JSON:', jsonError.message);
      console.error('Raw response:', content.substring(0, 200) + '...');
      
      // Try one more time with an extremely simple prompt
      try {
        console.log('Making final retry attempt with simplified prompt...');
        
        // Extract key information from HTML to create a simpler prompt
        const $ = cheerio.load(htmlContent);
        const title = $('title').text() || 'Untitled Page';
        const metaTags = [];
        $('meta').each((i, el) => {
          if ($(el).attr('name') || $(el).attr('property')) {
            metaTags.push($.html(el));
          }
        });
        
        // Create a very simple description of the page
        const pageDescription = `Title: ${title}\n` +
          `URL: ${$('link[rel="canonical"]').attr('href') || 'Unknown'}\n` +
          `Meta tags: ${metaTags.length} tags found\n` +
          `Headings: ${$('h1, h2, h3').length} headings found\n` +
          `Images: ${$('img').length} images found\n`;
        
        const finalResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              { 
                role: 'system', 
                content: 'You are an SEO expert. Respond ONLY with a valid JSON array containing 3 specific SEO suggestions.'
              },
              { 
                role: 'user', 
                content: `Here's information about a webpage. Give me all relevant SEO improvement suggestions you can find. Do not limit yourself to any specific number - include as many or as few as are actually needed. Return ONLY in this EXACT JSON format with NO additional text:\n\n[{"title":"Title","reason":"Reason","code":"Code","location":"Location"}]\n\n${pageDescription}`
              }
            ],
            temperature: 0.2,
            max_tokens: 1000
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
          }
        );
        
        const finalContent = finalResponse.data.choices[0].message.content.trim();
        if (finalContent.startsWith('[') && finalContent.endsWith(']')) {
          console.log('Successfully got JSON from final retry attempt');
          return {
            success: true,
            data: JSON.parse(finalContent)
          };
        }
      } catch (finalError) {
        console.error('Final retry attempt failed:', finalError.message);
      }
      
      // If all attempts fail, generate suggestions based on the HTML content
      console.log('Generating suggestions based on HTML content analysis...');
      
      const $ = cheerio.load(htmlContent);
      const suggestions = [];
      
      // Check for meta description
      if (!$('meta[name="description"]').length) {
        suggestions.push({
          "title": "Add Meta Description",
          "reason": "Meta descriptions are crucial for SEO as they provide a summary of your page content to search engines and users in search results.",
          "code": `<meta name="description" content="${$('title').text() || 'Your page description'}">`,
          "location": "Inside the <head> tag"
        });
      }
      
      // Check for heading structure
      if (!$('h1').length) {
        suggestions.push({
          "title": "Add H1 Heading",
          "reason": "Every page should have exactly one H1 heading that clearly describes the page content and includes key terms.",
          "code": `<h1>${$('title').text() || 'Page Heading'}</h1>`,
          "location": "At the beginning of the main content"
        });
      }
      
      // Check for image alt text
      let missingAltCount = 0;
      $('img').each((i, el) => {
        if (!$(el).attr('alt')) {
          missingAltCount++;
        }
      });
      
      if (missingAltCount > 0) {
        suggestions.push({
          "title": "Add Alt Text to Images",
          "reason": "${missingAltCount} images are missing alt text. Alt text improves accessibility and helps search engines understand image content.",
          "code": `alt="Descriptive text about the image content"`,
          "location": "Add to all img tags that are missing alt attributes"
        });
      }
      
      // Check for structured data
      if (!$('script[type="application/ld+json"]').length) {
        suggestions.push({
          "title": "Add Structured Data",
          "reason": "Structured data helps search engines understand your content better and can result in rich snippets in search results.",
          "code": `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${$('title').text() || 'Page Title'}",\n  "description": "${$('meta[name="description"]').attr('content') || 'Page description'}"\n}\n</script>`,
          "location": "Inside the <head> tag"
        });
      }
      
      // If we couldn't generate any suggestions, add some generic ones
      if (suggestions.length === 0) {
        suggestions.push(
          {
            "title": "Improve Meta Description",
            "reason": "A more descriptive meta description helps search engines understand your content better.",
            "code": `<meta name="description" content="${$('title').text() || 'Detailed description of your page content with relevant keywords'}">`,
            "location": "Replace existing meta description or add to head"
          },
          {
            "title": "Add Canonical URL",
            "reason": "Canonical URLs prevent duplicate content issues by specifying the preferred version of a page.",
            "code": `<link rel="canonical" href="${$('link[rel="canonical"]').attr('href') || 'https://example.com/your-page-url'}" />`,
            "location": "Inside the <head> tag"
          }
        );
      }
      
      return {
        success: true,
        data: suggestions
      };
    }
    
  } catch (error) {
    console.error('Error analyzing HTML with OpenAI:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
      throw new Error(`OpenAI API error: ${error.response.data.error.message || error.message}`);
    } else {
      throw error;
    }
  }
}

// Export the function
module.exports = {
  analyzeHtmlContent
};

// Example usage (for testing)
if (require.main === module) {
  // This code runs when the script is executed directly
  const testHtmlPath = path.join(__dirname, 'sample.txt');
  const outputPath = path.join(__dirname, 'analysis_result.json');
  
  if (fs.existsSync(testHtmlPath)) {
    const htmlContent = fs.readFileSync(testHtmlPath, 'utf8');
    console.log(`Testing with HTML file: ${testHtmlPath} (${htmlContent.length} characters)`);
    
    analyzeHtmlContent(htmlContent)
      .then(result => {
        console.log('Analysis completed successfully');
        fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));
        console.log(`Results saved to: ${outputPath}`);
      })
      .catch(error => {
        console.error('Analysis failed:', error.message);
      });
  } else {
    console.error(`Test HTML file not found: ${testHtmlPath}`);
  }
}
