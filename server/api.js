const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// OpenAI API endpoint
app.post('/api/analyze-html', async (req, res) => {
  try {
    const { htmlContent } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // In a production environment, you would use your actual OpenAI API key
    // For demo purposes, we're using a mock response
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key';
    
    // Check if we have a real API key
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-api-key') {
      // Prepare the prompt for OpenAI
      const prompt = `You are an expert in SEO, Generative Engine Optimization (GEO), and web accessibility.

Analyze the full HTML content provided below. Your goal is to generate specific, actionable improvement suggestions to optimize the page for AI-powered search engines like ChatGPT, Google SGE, and Perplexity.

Return your output as a JSON array of objects in the following format:

[
  {
    "title": "<Brief title of the proposed change>",
    "reason": "<Short explanation of why this improves SEO/GEO>",
    "code": "<The actual HTML/JSON code to add or modify>",
    "location": "<Where to apply it — e.g., 'inside <head>', 'before </body>', or 'replace meta description'>"
  }
]

Only return the JSON — no extra explanation, markdown, or commentary.

HTML:
${htmlContent}`;

      // Call OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an AI assistant that specializes in SEO and GEO optimization.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      // Parse the response
      let suggestions;
      try {
        const content = response.data.choices[0].message.content;
        suggestions = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        suggestions = [
          {
            title: 'Error Parsing Response',
            reason: 'There was an error parsing the AI response. Please try again.',
            code: '<!-- No code available -->',
            location: 'N/A'
          }
        ];
      }

      return res.json({ suggestions });
    } else {
      // Return mock data for demo purposes
      const mockSuggestions = [
        {
          "title": "Add Schema.org Article Markup",
          "reason": "Schema.org structured data helps AI search engines understand your content's context, purpose, and relationships. Article markup is particularly valuable for blog posts and news content.",
          "code": `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "description": "A brief description of your article content.",
  "image": "https://example.com/images/article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Organization",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2025-04-08T12:00:00Z",
  "dateModified": "2025-04-08T15:30:00Z"
}
</script>`,
          "location": "inside <head> before </head>"
        },
        {
          "title": "Improve Meta Description",
          "reason": "Your current meta description is missing or too generic. AI search engines use this to generate summaries and understand page content. A specific, keyword-rich description improves relevance signals.",
          "code": `<meta name="description" content="Detailed, keyword-rich description of your page content that includes primary keywords and clearly states the page's purpose and value proposition in 150-160 characters.">`,
          "location": "replace existing meta description or add inside <head>"
        },
        {
          "title": "Add FAQ Schema for Common Questions",
          "reason": "FAQ schema helps AI search engines identify questions and answers in your content, making it more likely to be featured in AI-generated responses and knowledge panels.",
          "code": `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is Generative Engine Optimization?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Generative Engine Optimization (GEO) is the practice of optimizing web content to be more effectively processed, understood, and surfaced by AI-powered search engines and assistants like ChatGPT, Google SGE, and Perplexity."
    }
  }, {
    "@type": "Question",
    "name": "How does GEO differ from traditional SEO?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "While traditional SEO focuses on keywords and backlinks for ranking in conventional search results, GEO emphasizes structured data, clear content organization, semantic HTML, and comprehensive information that helps AI systems understand and extract meaning from your content."
    }
  }]
}
</script>`,
          "location": "inside <head> before </head>"
        }
      ];
      
      return res.json({ suggestions: mockSuggestions });
    }
  } catch (error) {
    console.error('Error analyzing HTML:', error);
    res.status(500).json({ error: 'Error analyzing HTML content' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
