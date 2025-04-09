import React, { useState, useEffect, useRef } from "react";
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';

function SeoOptimizerTab() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("page-content");
  const [websiteContent, setWebsiteContent] = useState(null);
  const [markdownContent, setMarkdownContent] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [geoSuggestions, setGeoSuggestions] = useState([]);
  const [isLoadingGeoSuggestions, setIsLoadingGeoSuggestions] = useState(false);
  const [visibilityScore, setVisibilityScore] = useState(72);
  const [weeklyChange, setWeeklyChange] = useState(5);
  
  // Apply syntax highlighting when content changes
  useEffect(() => {
    if (websiteContent || markdownContent) {
      Prism.highlightAll();
    }
  }, [websiteContent, markdownContent, activeTab]);

  const convertHtmlToMarkdown = (html) => {
    // This is a simple conversion - in a real app, you would use a proper HTML to Markdown converter
    let markdown = html
      .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>([^<]+)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>([^<]+)<\/h6>/gi, '###### $1\n\n')
      .replace(/<p[^>]*>([^<]+)<\/p>/gi, '$1\n\n')
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)')
      .replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*')
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(match, list) {
        return list.replace(/<li[^>]*>([^<]+)<\/li>/gi, '* $1\n');
      })
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function(match, list) {
        let index = 1;
        return list.replace(/<li[^>]*>([^<]+)<\/li>/gi, function(match, item) {
          return (index++) + '. ' + item + '\n';
        });
      })
      .replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n')
      .replace(/<hr[^>]*>/gi, '---\n\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '');
    
    return markdown;
  };

  const fetchWebsiteContent = async (url) => {
    try {
      setFetchError(null);
      
      // Ensure URL has http/https prefix
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      
      console.log(`Fetching website content from: ${formattedUrl}`);
      const response = await fetch(`http://localhost:3005/api/fetch-website?url=${encodeURIComponent(formattedUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch website: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Website content fetched successfully');
      setWebsiteContent(data);
      
      // Convert HTML to Markdown
      const markdown = convertHtmlToMarkdown(data.html);
      setMarkdownContent(markdown);
      
      return data;
    } catch (error) {
      console.error('Error fetching website content:', error);
      setFetchError(error.message);
      return null;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setHtmlFile(file);
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const analyzeHtmlWithOpenAI = async (htmlContent) => {
    setIsLoadingGeoSuggestions(true);
    try {
      console.log(`HTML content size: ${htmlContent.length} characters`);
      
      // Prepare instructions for OpenAI
      const instructions = `Analyze the HTML content in the attached file. Your goal is to generate specific, actionable improvement suggestions to optimize the page for AI-powered search engines like ChatGPT, Google SGE, and Perplexity.

Return your output as a JSON array of objects in the following format:

[
  {
    "title": "<Brief title of the proposed change>",
    "reason": "<Short explanation of why this improves SEO/GEO>",
    "code": "<The actual HTML/JSON code to add or modify>",
    "location": "<Where to apply it — e.g., 'inside <head>', 'before </body>', or 'replace meta description'>"
  }
]

Only return the JSON — no extra explanation, markdown, or commentary.`;
      
      console.log('Sending HTML content to server for OpenAI analysis...');
      // Call our proxy endpoint to forward to OpenAI API
      const response = await fetch('http://localhost:3005/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          htmlContent: htmlContent,
          instructions: instructions
        }),
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `API request failed with status ${response.status}`;
        } catch (e) {
          // If we can't parse the error as JSON
          errorMessage = `API request failed with status ${response.status}. The response might be too large.`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('OpenAI API Response received');
      
      if (data.success && data.data && data.data.choices && data.data.choices.length > 0) {
        // Parse the JSON response from OpenAI
        try {
          const content = data.data.choices[0].message.content;
          console.log('Parsing OpenAI response content:', content.substring(0, 100) + '...');
          
          // Handle potential non-JSON responses
          let jsonContent = content;
          // If response starts with markdown code block, extract just the JSON
          if (content.startsWith('```json')) {
            jsonContent = content.replace(/```json\n|```/g, '');
          } else if (content.startsWith('```')) {
            jsonContent = content.replace(/```\n|```/g, '');
          }
          
          const suggestions = JSON.parse(jsonContent.trim());
          setGeoSuggestions(suggestions);
          
          // Calculate and set the visibility score based on the HTML content and suggestions
          const newScore = calculateVisibilityScore(htmlContent, suggestions);
          setVisibilityScore(newScore);
          
          // Generate and set a random weekly change
          const newWeeklyChange = generateWeeklyChange();
          setWeeklyChange(newWeeklyChange);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          throw new Error('Failed to parse OpenAI response. The response format was unexpected.');
        }
      } else {
        throw new Error('Invalid response format from OpenAI API');
      }
    } catch (error) {
      console.error('Error analyzing HTML with OpenAI:', error);
      alert(`Error analyzing HTML content: ${error.message}. Please try again.`);
      
      // Generate dynamic suggestions based on the HTML content
      const generateDynamicSuggestions = (htmlContent) => {
        const suggestions = [];
        
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Check for title and generate suggestion if needed
        const pageTitle = tempDiv.querySelector('title')?.textContent || '';
        if (pageTitle.length > 70 || pageTitle.includes('|') || pageTitle.includes('-')) {
          suggestions.push({
            "title": "Optimize Page Title",
            "reason": "The current title is too long or contains unnecessary separators. A concise, descriptive title improves click-through rates and is better for SEO.",
            "code": `<title>${pageTitle.split(/[\|\-]/)[0].trim()}</title>`,
            "location": "Replace existing title tag in <head>"
          });
        }
        
        // Check for meta description
        if (!tempDiv.querySelector('meta[name="description"]')) {
          suggestions.push({
            "title": "Add Meta Description",
            "reason": "Your page is missing a meta description. This is crucial for SEO as it provides a summary of your page content to search engines and users in search results.",
            "code": `<meta name="description" content="${pageTitle || 'Detailed description of your page content with relevant keywords'}">`,
            "location": "Inside the <head> tag"
          });
        }
        
        // Check for structured data
        if (!tempDiv.querySelector('script[type="application/ld+json"]')) {
          suggestions.push({
            "title": "Add Structured Data",
            "reason": "Structured data helps search engines understand your content better and can result in rich snippets in search results.",
            "code": `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${pageTitle || 'Page Title'}",
  "description": "${tempDiv.querySelector('meta[name="description"]')?.getAttribute('content') || 'Page description'}"
}
</script>`,
            "location": "Inside the <head> tag"
          });
        }
        
        // Check for image alt text
        let missingAltCount = 0;
        tempDiv.querySelectorAll('img').forEach(img => {
          if (!img.alt) missingAltCount++;
        });
        
        if (missingAltCount > 0) {
          suggestions.push({
            "title": "Add Alt Text to Images",
            "reason": `${missingAltCount} images are missing alt text. Alt text improves accessibility and helps search engines understand image content.`,
            "code": `alt="Descriptive text about the image content"`,
            "location": "Add to all img tags that are missing alt attributes"
          });
        }
        
        // Check for heading structure
        if (!tempDiv.querySelector('h1')) {
          suggestions.push({
            "title": "Add H1 Heading",
            "reason": "Every page should have exactly one H1 heading that clearly describes the page content and includes key terms.",
            "code": `<h1>${pageTitle || 'Page Heading'}</h1>`,
            "location": "At the beginning of the main content"
          });
        }
        
        // Check for canonical URL
        if (!tempDiv.querySelector('link[rel="canonical"]')) {
          suggestions.push({
            "title": "Add Canonical URL",
            "reason": "Canonical URLs prevent duplicate content issues by specifying the preferred version of a page.",
            "code": `<link rel="canonical" href="${websiteUrl}" />`,
            "location": "Inside the <head> tag"
          });
        }
        
        // Add more suggestions based on the content type if needed
        if (tempDiv.querySelector('article') || tempDiv.querySelector('blog')) {
          suggestions.push({
            "title": "Add Article Schema Markup",
            "reason": "Article schema helps search engines understand the content type and can improve visibility in search results.",
            "code": `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${pageTitle || 'Article Title'}",
  "datePublished": "${new Date().toISOString()}"
}
</script>`,
            "location": "Inside the <head> tag"
          });
        }
        
        return suggestions;
      };
      
      // Generate dynamic suggestions based on the HTML content
      const mockResponse = generateDynamicSuggestions(htmlContent);
      
      setGeoSuggestions(mockResponse);
      
      // Calculate and set the visibility score based on the HTML content and fallback suggestions
      const newScore = calculateVisibilityScore(htmlContent, mockResponse);
      setVisibilityScore(newScore);
      
      // Generate and set a random weekly change
      const newWeeklyChange = generateWeeklyChange();
      setWeeklyChange(newWeeklyChange);
    } finally {
      setIsLoadingGeoSuggestions(false);
    }
  };

  // Calculate visibility score based on the HTML content and suggestions
  const calculateVisibilityScore = (htmlContent, suggestions) => {
    // Base score starts at 50
    let score = 50;
    
    // Parse HTML to check for SEO elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Check for important SEO elements and add points
    if (tempDiv.querySelector('title')) score += 5;
    if (tempDiv.querySelector('meta[name="description"]')) score += 5;
    if (tempDiv.querySelector('h1')) score += 5;
    if (tempDiv.querySelector('link[rel="canonical"]')) score += 5;
    if (tempDiv.querySelector('script[type="application/ld+json"]')) score += 10;
    
    // Count images with alt text
    const images = tempDiv.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt'));
    if (images.length > 0) {
      const altTextPercentage = (imagesWithAlt.length / images.length) * 100;
      score += Math.round(altTextPercentage / 10); // Up to 10 points for alt text
    }
    
    // Deduct points based on number of suggestions (more suggestions = more issues)
    score -= Math.min(20, suggestions.length * 2); // Max deduction of 20 points
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  };
  
  // Generate a random weekly change between -3 and +8
  const generateWeeklyChange = () => {
    return Math.floor(Math.random() * 12) - 3; // Random number between -3 and +8
  };
  
  // Determine the priority level of a suggestion based on its content
  const getPriority = (suggestion) => {
    const title = suggestion.title.toLowerCase();
    const reason = suggestion.reason.toLowerCase();
    
    // High priority issues (critical for SEO/GEO)
    if (
      title.includes('schema') || 
      title.includes('structured data') ||
      title.includes('meta description') ||
      title.includes('canonical') ||
      reason.includes('critical') ||
      reason.includes('significant') ||
      reason.includes('essential')
    ) {
      return { className: 'high', label: 'High' };
    }
    
    // Low priority issues (nice to have)
    if (
      title.includes('alt text') ||
      title.includes('image') ||
      reason.includes('minor') ||
      reason.includes('optional') ||
      reason.includes('consider')
    ) {
      return { className: 'low', label: 'Low' };
    }
    
    // Medium priority for everything else
    return { className: 'warning', label: 'Med' };
  };
  
  const handleStartAnalysis = async () => {
    if (websiteUrl) {
      setIsAnalyzing(true);
      // Fetch website content through our proxy
      const data = await fetchWebsiteContent(websiteUrl);
      if (data && data.html) {
        await analyzeHtmlWithOpenAI(data.html);
      }
      setIsAnalyzing(false);
      setShowResults(true);
    } else {
      alert("Please enter a website URL");
    }
  };

  const handleConnectGithub = () => {
    // In a real implementation, this would open GitHub OAuth flow
    alert("GitHub connection feature coming soon");
  };

  const handleFixIssue = (issueType) => {
    alert(`Fixing ${issueType} issue...`);
  };

  const handlePreviewChange = () => {
    alert("Previewing changes...");
  };

  // Initial analysis form view
  const renderAnalysisForm = () => (
    <div className="seo-analyzer-content">
      <h1>Analyze Your Website for SEO<br />& GEO Optimization</h1>
      
      <p className="description">
        Upload an HTML file, paste a website URL, or connect a repo— Will scan<br />your content for opportunities.
      </p>
      
      <div className="analyzer-form">
        <div className="input-group">
          <label>Website URL</label>
          <input 
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="form-control"
          />
        </div>
        

        
        <button 
          className="github-button"
          onClick={handleConnectGithub}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          Connect GitHub Repository
        </button>
        
        <button 
          className="btn"
          onClick={handleStartAnalysis}
          disabled={isAnalyzing || !websiteUrl}
        >
          {isAnalyzing ? "Analyzing..." : "Start Analysis"}
        </button>
      </div>
    </div>
  );

  // Analysis results view
  const renderAnalysisResults = () => (
    <>
      <div className="visibility-score-card">
        <div className="score-info">
          <div className="score-label">Your AI Visibility Score:</div>
          <div className="score-value">{visibilityScore} <span className="score-max">/100</span></div>
          <div className={`score-change ${weeklyChange >= 0 ? 'positive' : 'negative'}`}>
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange} this week
          </div>
        </div>
      </div>
      
      <div className="seo-analysis-container">
        <div className="analysis-content">
          <div className="content-analysis-section">
            <h2 className="section-title">CONTENT ANALYSIS</h2>
            
            <div className="content-tabs">
              <div 
                className={`content-tab ${activeTab === 'page-content' ? 'active' : ''}`}
                onClick={() => setActiveTab('page-content')}
              >
                Page Content
              </div>
              <div 
                className={`content-tab ${activeTab === 'html' ? 'active' : ''}`}
                onClick={() => setActiveTab('html')}
              >
                HTML
              </div>
              <div 
                className={`content-tab ${activeTab === 'markdown' ? 'active' : ''}`}
                onClick={() => setActiveTab('markdown')}
              >
                Markdown
              </div>
            </div>
            
            <div className="content-preview">
              {activeTab === 'page-content' ? (
                <div className="website-preview">
                  <div className="iframe-container">
                    {fetchError ? (
                      <div className="iframe-fallback">
                        <h3>Error fetching content from: {websiteUrl}</h3>
                        <p>{fetchError}</p>
                        <p>Please try a different URL or check if the website is accessible.</p>
                      </div>
                    ) : !websiteContent ? (
                      <div className="iframe-fallback">
                        <h3>Analyzing content from: {websiteUrl}</h3>
                        <p>Loading website content...</p>
                      </div>
                    ) : (
                      <div className="website-content-container">
                        <iframe 
                          srcDoc={websiteContent.html}
                          title="Website Preview" 
                          className="website-iframe"
                          sandbox="allow-same-origin allow-scripts allow-forms"
                          referrerPolicy="no-referrer"
                          width="100%"
                          height="700px"
                          key="website-iframe-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'html' && websiteContent ? (
                <div className="contained-code-view">
                  <div className="code-editor-header">
                    <div className="file-tab">index.html</div>
                    <div className="editor-controls">
                      <span className="line-count">{websiteContent.html.split('\n').length} lines</span>
                    </div>
                  </div>
                  <div className="code-content">
                    {/* Format the HTML with a simple formatter to ensure it's contained */}
                    {websiteContent.html.split('\n').map((line, index) => (
                      <div key={index} className="code-line">
                        <span className="line-number">{index + 1}</span>
                        <span className="line-content" dangerouslySetInnerHTML={{ 
                          __html: Prism.highlight(line, Prism.languages.markup, 'html') 
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'markdown' && markdownContent ? (
                <div className="contained-code-view">
                  <div className="code-editor-header">
                    <div className="file-tab">content.md</div>
                    <div className="editor-controls">
                      <span className="line-count">{markdownContent.split('\n').length} lines</span>
                    </div>
                  </div>
                  <div className="code-content">
                    {/* Format the Markdown with a line-by-line approach */}
                    {markdownContent.split('\n').map((line, index) => (
                      <div key={index} className="code-line">
                        <span className="line-number">{index + 1}</span>
                        <span className="line-content" dangerouslySetInnerHTML={{ 
                          __html: Prism.highlight(line, Prism.languages.markdown, 'markdown') 
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="featured-image-placeholder">
                    <span>Featured Image</span>
                  </div>
                  
                  <h3 className="content-title">Introducing Our Latest AI-Powered Features</h3>
                  
                  <div className="content-meta">
                    <span className="author-initials">JD</span>
                    <span className="author-name">John Doe</span>
                    <span className="meta-separator">•</span>
                    <span className="publish-date">Mar 12, 2025</span>
                    <span className="meta-separator">•</span>
                    <span className="read-time">4 min read</span>
                  </div>
                  
                  <p className="content-paragraph">
                    Our team is excited to share the newest updates to our platform.
                  </p>
                  
                  <p className="content-paragraph">
                    These features are designed to help developers build better 
                    <a href="#" className="content-link">applications with less effort</a> and improved reliability.
                  </p>
                  
                  <h4 className="content-subheading">Key Improvements:</h4>
                  
                  <ul className="content-list">
                    <li>Enhanced real-time collaboration tools</li>
                    <li>New API endpoints for advanced data processing</li>
                    <li>Improved performance on large <a href="#" className="content-link">datasets</a></li>
                  </ul>
                  
                  <div className="content-chart">
                    <div className="chart-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      Performance Chart
                    </div>
                  </div>
                  
                  <div className="schema-success-message">
                    <div className="success-indicator"></div>
                    <div className="success-text">
                      Schema markup implemented successfully
                      <span className="success-icon">✓</span>
                      <div className="success-subtext">View changes in Live Experiments</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="geo-suggestions-panel">
          <h3 className="panel-title">GEO Suggestions</h3>
          <div className="issues-count">{geoSuggestions.length} issues found</div>
          
          {isLoadingGeoSuggestions ? (
            <div className="loading-suggestions">
              <div className="loading-spinner"></div>
              <p>Analyzing content and generating suggestions...</p>
            </div>
          ) : geoSuggestions.length > 0 ? (
            geoSuggestions.map((suggestion, index) => (
              <div key={index} className={`issue-card ${getPriority(suggestion).className}`}>
                <div className="issue-header">
                  <div className="issue-title">{suggestion.title}</div>
                  <div className="issue-severity">{getPriority(suggestion).label}</div>
                </div>
                
                <div className="issue-description">
                  {suggestion.reason}
                </div>
                
                <div className="issue-code">
                  <pre>
                    <code className="language-markup" dangerouslySetInnerHTML={{ 
                      __html: Prism.highlight(suggestion.code, Prism.languages.markup, 'html') 
                    }} />
                  </pre>
                </div>
                
                <div className="issue-location">
                  <span>Location: {suggestion.location}</span>
                </div>
                
                <div className="issue-actions">
                  <button className="fix-button" onClick={() => handleFixIssue(index)}>Fix It</button>
                  <button className="preview-button" onClick={handlePreviewChange}>Preview Change</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-suggestions">
              <p>No suggestions found. Try uploading a different HTML file or entering a website URL.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="seo-optimizer-container">
      {showResults ? renderAnalysisResults() : renderAnalysisForm()}
    </div>
  );
}

export default SeoOptimizerTab;
