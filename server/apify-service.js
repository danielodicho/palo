const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

// Path to store cached LinkedIn posts
const CACHE_FILE_PATH = path.join(__dirname, 'data', 'linkedin-posts-cache.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize the ApifyClient with API token from environment variables
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Fetch LinkedIn posts using Apify
 * @param {Array} urls - Array of LinkedIn URLs to scrape
 * @param {Object} options - Additional options for the scraper
 * @returns {Promise<Array>} - Array of LinkedIn posts
 */
async function fetchLinkedInPosts(urls = [], options = {}) {
  try {
    console.log('Fetching LinkedIn posts using Apify...');
    
    // Check if API token is available
    if (!process.env.APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is not set in the environment variables');
    }
    
    // Prepare Actor input
    const input = {
      urls: urls.length > 0 ? urls : [
        "https://www.linkedin.com/in/danielodicho/",
      ],
      deepScrape: options.deepScrape !== undefined ? options.deepScrape : true,
      rawData: false,
      minDelay: options.minDelay || 2,
      maxDelay: options.maxDelay || 8,
      proxy: {
        useApifyProxy: true,
        apifyProxyCountry: "US"
      }
    };
    
    // Run the Actor and wait for it to finish
    console.log('Running Apify Actor...');
    const run = await client.actor("kfiWbq3boy3dWKbiL").call(input);
    console.log(`Actor finished with status: ${run.status}`);
    
    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Retrieved ${items.length} items from LinkedIn`);
    
    // Process and format the posts - focus on actual posts
    const formattedPosts = items
      .filter(item => item.type === 'post' || item.postUrl) // Filter to include only posts
      .map(item => {
        return {
          id: item.postId || item.postUrl,
          type: item.type,
          url: item.postUrl || item.url,
          author: item.author ? {
            name: item.author.name,
            profileUrl: item.author.profileUrl,
            imageUrl: item.author.imageUrl
          } : null,
          content: item.text,
          timestamp: item.timestamp,
          stats: {
            likes: item.likeCount || 0,
            comments: item.commentCount || 0,
            shares: item.shareCount || 0
          },
          media: item.images || []
        };
      })
      .filter(post => post.url && post.url !== "https://www.linkedin.com/in/danielodicho/"); // Exclude the profile URL itself
    
    console.log(`Formatted ${formattedPosts.length} posts`);
    
    // Cache the results
    cacheLinkedInPosts(formattedPosts);
    
    return formattedPosts;
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    
    // If there's an error, try to return cached posts
    const cachedPosts = getCachedLinkedInPosts();
    if (cachedPosts.length > 0) {
      console.log('Returning cached LinkedIn posts');
      return cachedPosts;
    }
    
    throw error;
  }
}

/**
 * Cache LinkedIn posts to a file
 * @param {Array} posts - Array of LinkedIn posts to cache
 */
function cacheLinkedInPosts(posts) {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({
      timestamp: Date.now(),
      posts
    }, null, 2));
    console.log(`Cached ${posts.length} LinkedIn posts`);
  } catch (error) {
    console.error('Error caching LinkedIn posts:', error);
  }
}

/**
 * Get cached LinkedIn posts
 * @param {number} maxAgeMs - Maximum age of cached posts in milliseconds (default: 24 hours)
 * @returns {Array} - Array of cached LinkedIn posts
 */
function getCachedLinkedInPosts(maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return [];
    }
    
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8'));
    const cacheAge = Date.now() - cacheData.timestamp;
    
    // Return empty array if cache is too old
    if (cacheAge > maxAgeMs) {
      console.log('Cache is too old, returning empty array');
      return [];
    }
    
    console.log(`Retrieved ${cacheData.posts.length} posts from cache (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
    return cacheData.posts;
  } catch (error) {
    console.error('Error getting cached LinkedIn posts:', error);
    return [];
  }
}

module.exports = {
  fetchLinkedInPosts,
  getCachedLinkedInPosts
};
