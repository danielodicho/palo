import React, { useState, useEffect } from "react";
import axios from "axios";

const MyPostsTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch LinkedIn posts from our API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/linkedin_posts');
        if (response.data.success) {
          setPosts(response.data.posts);
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
      <h2 className="section-title">Published Posts</h2>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't published any posts yet.</p>
          <button className="btn btn-small">Create New Post</button>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post, index) => (
            <div key={index} className="post-item">
              <div className="post-header">
                <h3 className="post-title">LinkedIn Post</h3>
                <div className="post-platform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
              </div>
              <div className="post-content">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
                  {post.url}
                </a>
              </div>
              <div className="post-footer">
                <span className="post-date">Published: {formatDate(post.receivedAt)}</span>
                <div className="post-actions">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="btn btn-small">View Post</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsTab;
