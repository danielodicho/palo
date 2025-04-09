import React, { useState, useEffect } from "react";
import axios from "axios";
import DOMPurify from 'dompurify';

const MyPostsTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('cache');
  const [postContents, setPostContents] = useState({});

  // Fetch LinkedIn posts from our API
  const fetchPosts = async (useApify = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/api/linkedin_posts${useApify ? '?useApify=true' : ''}`);
      if (response.data.success) {
        setPosts(response.data.posts);
        setDataSource(useApify ? 'Apify API' : 'Local Cache');
        
        // Fetch content for each post
        fetchPostContents(response.data.posts);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch post contents
  const fetchPostContents = async (postsData) => {
    const contents = {};
    for (const post of postsData) {
      if (post.url) {
        try {
          // We'll use a proxy on our backend to avoid CORS issues
          const response = await axios.post('http://localhost:5001/api/fetch-post-content', { url: post.url });
          if (response.data.success) {
            contents[post.url] = response.data.content;
          }
        } catch (err) {
          console.error(`Error fetching content for ${post.url}:`, err);
        }
      }
    }
    setPostContents(contents);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-indicator">Loading your posts...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading posts: {error}</div>;
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h2 className="section-title">LinkedIn Posts</h2>
        <div className="posts-controls">
          <span className="data-source">Source: {dataSource}</span>
          <button 
            className="refresh-btn" 
            onClick={() => fetchPosts(true)} 
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh from LinkedIn'}
          </button>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No LinkedIn posts found.</p>
          <button className="btn btn-primary" onClick={() => fetchPosts(true)}>Fetch Posts from LinkedIn</button>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post, index) => (
            <div key={index} className="post-card">
              <div className="post-card-header">
                {post.author && post.author.imageUrl && (
                  <img 
                    src={post.author.imageUrl} 
                    alt={post.author?.name || 'LinkedIn User'} 
                    className="author-image"
                  />
                )}
                <div className="post-meta">
                  <h3 className="author-name">{post.author?.name || 'LinkedIn User'}</h3>
                  <div className="post-date">{formatDate(post.timestamp || post.receivedAt)}</div>
                </div>
                <div className="linkedin-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
              </div>
              
              <div className="post-card-content">
                {post.content ? (
                  <div className="post-text">{post.content}</div>
                ) : postContents[post.url] ? (
                  <div 
                    className="post-embedded-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(postContents[post.url]) }}
                  />
                ) : (
                  <div className="post-preview">
                    <p>LinkedIn post preview</p>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
                      {post.url}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="post-card-footer">
                {post.stats && (
                  <div className="post-stats">
                    <span>{post.stats.likes || 0} likes</span>
                    <span>{post.stats.comments || 0} comments</span>
                    <span>{post.stats.shares || 0} shares</span>
                  </div>
                )}
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="view-post-btn">
                  View on LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsTab;
