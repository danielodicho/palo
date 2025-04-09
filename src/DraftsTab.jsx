import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

function DraftsTab() {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load drafts when component mounts
  useEffect(() => {
    loadDrafts();
  }, []);

  // Load all drafts
  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/drafts');
      if (response.data.success) {
        setDrafts(response.data.drafts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      setError('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a draft
  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/drafts/${draftId}`);
      if (response.data.success) {
        // Remove draft from state
        setDrafts(drafts.filter(draft => draft.id !== draftId));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Failed to delete draft');
    }
  };

  // Edit a draft
  const handleEditDraft = (draftId) => {
    navigate(`/edit/${draftId}`);
  };

  if (isLoading) {
    return <div>Loading drafts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (drafts.length === 0) {
    return (
      <div className="drafts-empty-state">
        <h2>No drafts yet</h2>
        <p>Your saved drafts will appear here.</p>
        <button onClick={() => navigate('/')} className="create-draft-button">
          Create New Draft
        </button>
      </div>
    );
  }

  return (
    <div className="drafts-container">
      <h2>My Drafts</h2>
      <div className="drafts-list">
        {drafts.map(draft => (
          <div key={draft.id} className="draft-item">
            <div className="draft-content">
              <div className="draft-text">{draft.content}</div>
              <div className="draft-meta">
                <span className="draft-date">
                  {new Date(draft.createdAt).toLocaleDateString()}
                </span>
                <div className="draft-platforms">
                  {draft.platforms.map(platform => (
                    <span key={platform} className="platform-tag">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="draft-actions">
              <button
                onClick={() => handleEditDraft(draft.id)}
                className="edit-button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteDraft(draft.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DraftsTab;
