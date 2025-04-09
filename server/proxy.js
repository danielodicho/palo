const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const FormData = require('form-data');

const execPromise = util.promisify(exec);
const app = express();
const PORT = 3010;

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Helper function to validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

app.use(cors());
// Increase JSON payload limit to handle larger HTML content
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Endpoint to fetch and process website content using wget
app.get('/api/fetch-website', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required', message: 'Please provide a URL to fetch' });
    }

    // Validate URL format
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    if (!isValidUrl(targetUrl)) {
      return res.status(400).json({ error: 'Invalid URL format', message: 'The provided URL is not valid' });
    }
    
    console.log(`Attempting to fetch content from: ${targetUrl}`);
    
    // Generate a unique filename based on timestamp
    const timestamp = Date.now();
    const outputFilename = path.join(tempDir, `website_${timestamp}.html`);
    
    let $; // Cheerio object
    
    try {
      // Use wget to download the website content
      console.log(`Fetching ${targetUrl} with wget...`);
      
      // Add timeout and retry options to wget with additional parameters for e-commerce sites
      await execPromise(`wget -O "${outputFilename}" --timeout=30 --tries=3 --wait=1 --random-wait --no-check-certificate --adjust-extension=off --convert-links=off --page-requisites=off --no-cookies=off --keep-session-cookies --save-cookies=/tmp/cookies.txt --load-cookies=/tmp/cookies.txt --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" "${targetUrl}"`);
      
      // Check if file exists and has content
      if (!fs.existsSync(outputFilename) || fs.statSync(outputFilename).size === 0) {
        throw new Error('wget downloaded an empty file');
      }
      
      // Read the downloaded file
      const html = fs.readFileSync(outputFilename, 'utf8');
      
      // Parse the HTML content
      $ = cheerio.load(html);
      console.log(`Successfully fetched ${targetUrl} with wget`);
    } catch (wgetError) {
      console.error('Error using wget:', wgetError);
      
      // Clean up any partial file that might have been created
      if (fs.existsSync(outputFilename)) {
        try {
          fs.unlinkSync(outputFilename);
        } catch (unlinkError) {
          console.error('Error removing partial file:', unlinkError);
        }
      }
      
      // Fallback to axios if wget fails
      console.log('Falling back to axios...');
      try {
        // Use more browser-like headers for e-commerce sites
        const response = await axios.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/'
          },
          timeout: 30000, // 30 seconds timeout
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept status codes between 200 and 499
          }
        });
        
        // Parse the HTML content
        $ = cheerio.load(response.data);
        console.log(`Successfully fetched ${targetUrl} with axios`);
      } catch (axiosError) {
        console.error('Error using axios:', axiosError);
        return res.status(500).json({
          error: 'Failed to fetch website content',
          message: `Could not fetch content from ${targetUrl}. Please check the URL and try again.`
        });
      }
    }
    
    // Process the HTML content
    try {
      // Fix all URLs in the HTML to be absolute
      // First, handle images
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//')) {
              $(el).attr('src', new URL(src, targetUrl).href);
            } else if (src.startsWith('//')) {
              // Handle protocol-relative URLs
              $(el).attr('src', 'https:' + src);
            }
            // Add loading="lazy" for better performance
            $(el).attr('loading', 'lazy');
          } catch (e) {
            console.error(`Error fixing image URL: ${src}`, e.message);
          }
        }
      });
      
      // Handle CSS links
      $('link').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            if (!href.startsWith('http') && !href.startsWith('data:') && !href.startsWith('//')) {
              $(el).attr('href', new URL(href, targetUrl).href);
            } else if (href.startsWith('//')) {
              // Handle protocol-relative URLs
              $(el).attr('href', 'https:' + href);
            }
          } catch (e) {
            console.error(`Error fixing link URL: ${href}`, e.message);
          }
        }
      });
      
      // Handle scripts
      $('script').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//')) {
              $(el).attr('src', new URL(src, targetUrl).href);
            } else if (src.startsWith('//')) {
              // Handle protocol-relative URLs
              $(el).attr('src', 'https:' + src);
            }
          } catch (e) {
            console.error(`Error fixing script URL: ${src}`, e.message);
          }
        }
      });
      
      // Handle all other elements with src, srcset, or background attributes
      $('*[srcset]').each((i, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
          try {
            const newSrcset = srcset.split(',').map(src => {
              const [url, size] = src.trim().split(' ');
              if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('//')) {
                return `${new URL(url, targetUrl).href} ${size || ''}`;
              } else if (url && url.startsWith('//')) {
                return `https:${url} ${size || ''}`;
              }
              return src;
            }).join(', ');
            $(el).attr('srcset', newSrcset);
          } catch (e) {
            console.error(`Error fixing srcset: ${srcset}`, e.message);
          }
        }
      });
      
      // Fix inline styles with url()
      $('*[style]').each((i, el) => {
        const style = $(el).attr('style');
        if (style && style.includes('url(')) {
          try {
            const newStyle = style.replace(/url\(['"](.*?)['"]\)/g, (match, url) => {
              if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('//')) {
                return `url('${new URL(url, targetUrl).href}')`;
              } else if (url.startsWith('//')) {
                return `url('https:${url}')`;
              }
              return match;
            });
            $(el).attr('style', newStyle);
          } catch (e) {
            console.error(`Error fixing inline style: ${style}`, e.message);
          }
        }
      });
      
      // Clean up the file if it exists
      if (fs.existsSync(outputFilename)) {
        fs.unlinkSync(outputFilename);
      }
    } catch (processingError) {
      console.error('Error processing HTML:', processingError);
      // Continue anyway, as we still want to return the HTML even if processing failed
    }
    
    // Add base tag to ensure all relative URLs are resolved correctly
    if (!$('base').length) {
      $('head').prepend(`<base href="${targetUrl}">`);  
    }
    
    // Add meta tag to allow cross-origin images
    if (!$('meta[http-equiv="Content-Security-Policy"]').length) {
      $('head').prepend('<meta http-equiv="Content-Security-Policy" content="img-src * data:; default-src *; style-src * \'unsafe-inline\'; script-src * \'unsafe-inline\' \'unsafe-eval\'">');
    }
    
    // Return the processed HTML
    const title = $('title').text() || 'No title found';
    const html = $.html();
    
    console.log(`Returning HTML content for ${targetUrl} (title: ${title}, size: ${html.length} bytes)`);
    
    res.send({
      html: html,
      title: title,
      url: targetUrl
    });
    
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ 
      error: 'Failed to fetch website', 
      message: error.message || 'An unknown error occurred while fetching the website'
    });
  }
});

// Import our HTML analyzer module
const { analyzeHtmlContent } = require('./openai_html_analyzer');

// Endpoint to forward requests to OpenAI API
app.post('/api/openai', async (req, res) => {
  try {
    const { htmlContent, instructions } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    console.log(`Received HTML content for analysis (${htmlContent.length} characters)`);
    
    // Create a temporary file with the HTML content for logging/debugging
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Use our HTML analyzer module to analyze the content
    try {
      console.log('Analyzing HTML content with OpenAI...');
      const analysisResult = await analyzeHtmlContent(htmlContent, instructions);
      
      // Return the analysis result
      res.json({
        success: true,
        data: {
          choices: [
            {
              message: {
                content: Array.isArray(analysisResult.data) 
                  ? JSON.stringify(analysisResult.data)
                  : analysisResult.data
              }
            }
          ]
        }
      });
      
      console.log('Successfully sent OpenAI analysis response to client');
    } catch (analysisError) {
      console.error('Error analyzing HTML content:', analysisError.message);
      throw analysisError;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
    
    res.status(statusCode).json({ 
      error: 'Failed to call OpenAI API', 
      message: errorMessage 
    });
    console.error(`Sent error response to client: ${errorMessage}`);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
