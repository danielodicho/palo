import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const DraftsTab = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for drafts - in a real app, this would come from a database
  useEffect(() => {
    // Simulate API call to get drafts
    setTimeout(() => {
      const mockDrafts = [
        {
          id: "draft-1",
          title: "Product Launch Announcement",
          content: "Excited to announce our new product launch next week...",
          platform: "linkedin",
          lastEdited: "2025-04-07T14:30:00Z"
        },
        {
          id: "draft-2",
          title: "Industry Insights",
          content: "The latest trends in our industry show that...",
          platform: "linkedin",
          lastEdited: "2025-04-06T09:15:00Z"
        },
        {
          id: "draft-3",
          title: "Team Spotlight",
          content: "Meet our amazing team members who make everything possible...",
          platform: "linkedin",
          lastEdited: "2025-04-05T16:45:00Z"
        }
      ];
      setDrafts(mockDrafts);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-indicator">Loading drafts...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading drafts: {error}</div>;
  }

  return (
    <div className="drafts-container">
      <h2 className="section-title">Saved Drafts</h2>
      
      {drafts.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any saved drafts yet.</p>
          <button className="btn btn-small">Create New Post</button>
        </div>
      ) : (
        <div className="drafts-list">
          {drafts.map(draft => (
            <Link to={`/edit-draft/${draft.id}`} key={draft.id} className="draft-link">
              <div className="draft-item">
                <div className="draft-header">
                  <h3 className="draft-title">{draft.title}</h3>
                  <div className="draft-platform">
                    {draft.platform === "linkedin" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="draft-content">{draft.content.substring(0, 100)}...</div>
                <div className="draft-footer">
                  <span className="draft-date">Last edited: {formatDate(draft.lastEdited)}</span>
                  <div className="draft-actions">
                    <button className="btn btn-small">Edit</button>
                    <button className="btn btn-small btn-outline">Delete</button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsTab;
