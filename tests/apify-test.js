const { ApifyClient } = require('apify-client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

// Initialize the ApifyClient with API token from environment variables
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN || '<YOUR_API_TOKEN>',
});

// Prepare Actor input
const input = {
    "urls": [
        "https://www.linkedin.com/in/danielodicho/",
    ],
    "deepScrape": false,
    "rawData": false,
    "minDelay": 2,
    "maxDelay": 8,
    "cookie": [
        {
            "domain": ".linkedin.com",
            "expirationDate": 1775078983.667063,
            "hostOnly": false,
            "httpOnly": false,
            "name": "bcookie",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "\"v=2&1625c694-6e2c-4081-8207-94e72f3274cf\""
        },
        {
            "domain": "www.linkedin.com",
            "expirationDate": 1749940868,
            "hostOnly": true,
            "httpOnly": false,
            "name": "g_state",
            "path": "/",
            "sameSite": null,
            "secure": false,
            "session": false,
            "storeId": null,
            "value": "{\"i_l\":0}"
        },
        {
            "domain": ".linkedin.com",
            "hostOnly": false,
            "httpOnly": true,
            "name": "fptctx2",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": true,
            "storeId": null,
            "value": "taBcrIH61PuCVH7eNCyH0I1otfYAPn9VOPY9aMX8tO0xw99aMGJrcAhP0QgGrX6rNjrl2ddWxbMYgtfvGbp8SQW7Gn0yrgygqAtxMn4tjDjR8EZMNXcsKPUib4M%252fp2az5tqMPpnM0ZeZL99sOgkgPOYYSFNuIwJOdySAUM7hI%252bS5DabSIMZrb7S%252bkU6FZtSz%252faAc2tqU1x0uc2IuV60%252bczaFVt%252bZ9K4hv5sNV7HC%252fb5ZokgKZTNGXCKJ7E8R2pNcUOeIIuEjktxoAO0PlKQzpb6YeeucTod7aSyoILLdiOertsq%252bXWSu8cu%252bxXjqM3BHctol0wyrpqL%252fbMw79Ky9Dl3RVnZiVWs4SN5101mjtdo%253d"
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1775078983.666644,
            "hostOnly": false,
            "httpOnly": true,
            "name": "li_at",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "AQEDATDRuVkFiyovAAABk9GiEf4AAAGWF08fNk0ATPmi3BNkGjHfT2DGY3fgtI-pj6fKqjcqWAaidiXh_jAZmrdc2i5_5xI0xal2hC_T4aGv4pHh4Y_jllpSMRMRuNGdsM2ZNwTWe4Rdv8rfU-kcwT5j"
        },
        {
            "domain": ".linkedin.com",
            "hostOnly": false,
            "httpOnly": false,
            "name": "lang",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": true,
            "storeId": null,
            "value": "v=2&lang=en-us"
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1744067740.462308,
            "hostOnly": false,
            "httpOnly": false,
            "name": "lidc",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "\"b=TB41:s=T:r=T:a=T:p=T:g=4939:u=1292:x=1:i=1744006324:t=1744067739:v=2:sig=AQHPNz0S73tUWoUimCmv_te69sfieOld\""
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1775078983.667145,
            "hostOnly": false,
            "httpOnly": true,
            "name": "bscookie",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "\"v=1&202412080317588530473f-5fd1-4e4b-898a-d3d4445f7acbAQHyvYgIMi8jwjJXzcx0rSvLHkWi92Vu\""
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1765924883.013996,
            "hostOnly": false,
            "httpOnly": true,
            "name": "dfpfpt",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "ab88f98b02e2478d849e0e87576447ec"
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1775078983.666972,
            "hostOnly": false,
            "httpOnly": false,
            "name": "JSESSIONID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "\"ajax:0942650099760022326\""
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1759608667,
            "hostOnly": false,
            "httpOnly": false,
            "name": "li_theme",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "light"
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1759608667,
            "hostOnly": false,
            "httpOnly": false,
            "name": "li_theme_set",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "app"
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1775078983.666873,
            "hostOnly": false,
            "httpOnly": false,
            "name": "liap",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "true"
        },
        {
            "domain": ".www.linkedin.com",
            "expirationDate": 1745266267,
            "hostOnly": false,
            "httpOnly": false,
            "name": "timezone",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "America/Chicago"
        },
        {
            "domain": ".linkedin.com",
            "expirationDate": 1746648668,
            "hostOnly": false,
            "httpOnly": false,
            "name": "UserMatchHistory",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "AQJEK8jmUEuFtQAAAZYR4M_RvPoKzoveKXImVG3bakyS9WHLrg5b4EdLJGjDEkJvtaYjELVNkHSrk3W-6YpKGUw1iF--upEMbVEBT_SHJnMa4BRwC8EyoYpQwII-35Qvgqn-RUzmAqChZPTeZzlpoSb0CKFbuLqxJE7g-zRKyTyRqDkIeyf6DHk6P0GKFsN0meVF3FO9T235y7rBkgsakw9Omz4A4TavYJVsEh09nGRrx2hzO7sZx6Q60l_yhYRyaumMN012VWAzBtMtVqFfph6160bpnUcPDh10E0sZ8lorkZrPvyTGah34ccvxAgNq2KQDehBtDpTDYFkUXRC4"
        }
    ],
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyCountry": "US"
    }
};

// Function to save results to a JSON file
const saveResultsToFile = (data, filename = 'apify-linkedin-results.json') => {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Results saved to ${filePath}`);
};

(async () => {
    try {
        console.log('Starting Apify LinkedIn scraper...');
        
        // Check if API token is available
        if (!process.env.APIFY_API_TOKEN || process.env.APIFY_API_TOKEN === '<YOUR_API_TOKEN>') {
            console.error('Error: APIFY_API_TOKEN is not set in the environment variables');
            console.log('Please add your Apify API token to the .env file');
            process.exit(1);
        }
        
        // Run the Actor and wait for it to finish
        console.log('Running Actor...');
        const run = await client.actor("kfiWbq3boy3dWKbiL").call(input);
        console.log(`Actor finished with status: ${run.status}`);
        
        // Fetch Actor results from the run's dataset
        console.log('Fetching results from dataset...');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        // Log the number of items retrieved
        console.log(`Retrieved ${items.length} items from LinkedIn`);
        
        // Process and format the posts to only include URLs
        const formattedPosts = items.map(item => {
            // Extract just the URL from each item
            return {
                type: item.type,
                url: item.postUrl || item.url || (item.author ? item.author.profileUrl : null)
            };
        }).filter(post => post.url); // Filter out any items without URLs
        
        // Save the formatted results
        saveResultsToFile(formattedPosts);
        
        // Print all post URLs
        console.log('\nLinkedIn post URLs:');
        formattedPosts.forEach(post => console.log(post.url));
        
    } catch (error) {
        console.error('Error running Apify actor:', error);
    }
})();
