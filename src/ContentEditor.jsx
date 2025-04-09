import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import './styles.css';

function ContentEditor() {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(draftId ? true : false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeAITool, setActiveAITool] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const toastRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    postContent: "",
    platforms: ["linkedin"], // Default to LinkedIn
    postDate: "",
    postTime: ""
  });

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Character count state
  const [characterCount, setCharacterCount] = useState(0);

  // Load draft if editing an existing one
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  // Load a draft by ID
  const loadDraft = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/drafts/${id}`);
      if (response.data.success) {
        const { content, platforms } = response.data.draft;
        setFormData(prev => ({
          ...prev,
          postContent: content,
          platforms: platforms || ['linkedin']
        }));
        setCharacterCount(content.length);
        setIsEditingDraft(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setSubmitError('Failed to load draft');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Process any inline prompts before submitting
      const processedContent = await processInlinePrompts(formData.postContent);
      
      const response = await axios.post('/api/posts', {
        content: processedContent,
        platforms: formData.platforms,
        postDate: formData.postDate,
        postTime: formData.postTime
      });
      
      if (response.data.success) {
        setSubmitSuccess(true);
        showToast('Post submitted successfully!');
        navigate('/?tab=posts');
      } else {
        throw new Error(response.data.error || 'Failed to submit post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setSubmitError('Failed to submit post');
      showToast(`Failed to submit post: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving draft
  const handleSaveDraft = async () => {
    if (!formData.postContent.trim()) {
      showToast('Please enter some content before saving', 'error');
      return;
    }

    setIsSavingDraft(true);
    setSubmitError(null);

    try {
      const endpoint = isEditingDraft ? `/api/drafts/${draftId}` : '/api/drafts';
      const method = isEditingDraft ? 'put' : 'post';
      
      const response = await axios[method](endpoint, {
        content: formData.postContent,
        platforms: formData.platforms
      });

      if (response.data.success) {
        showToast('Draft saved successfully!');
        navigate('/?tab=drafts');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSubmitError('Failed to save draft');
      showToast('Failed to save draft', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle content change
  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, postContent: content }));
    setCharacterCount(content.length);
  };

  // Handle platform toggle
  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // Show toast message
  const showToast = (message, type = 'success') => {
    if (toastRef.current) {
      toastRef.current.textContent = message;
      toastRef.current.className = `toast ${type}`;
      toastRef.current.style.display = 'block';
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.style.display = 'none';
        }
      }, 3000);
    }
  };

  // Process inline prompts and generate content
  const processInlinePrompts = async (text) => {
    const promptRegex = /##\[(.*?)\]/g;
    let lastIndex = 0;
    let finalContent = "";
    let match;

    while ((match = promptRegex.exec(text)) !== null) {
      // Add text before the prompt
      finalContent += text.slice(lastIndex, match.index);
      
      // Generate content for the prompt
      try {
        const response = await axios.post('/api/gemini/generate', {
          prompt: match[1],
          files: [],
          history: []
        });

        if (response.data.success) {
          finalContent += response.data.content;
        }
      } catch (error) {
        console.error('Error processing inline prompt:', error);
        finalContent += match[0]; // Keep original prompt text if generation fails
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    finalContent += text.slice(lastIndex);
    return finalContent;
  };

  if (isLoading) {
    return <div>Loading draft...</div>;
  }

  return (
    <div className="modern-editor-container">
      <header className="editor-header">
        <div className="editor-breadcrumb">
          <h3>{draftId ? "Edit Draft" : "Create Content"}</h3>
        </div>
        <div className="editor-actions">
          <button 
            onClick={() => setShowSchedule(!showSchedule)} 
            className="modern-button secondary"
          >
            {showSchedule ? "Hide Schedule" : "Schedule"}
          </button>
          <button 
            onClick={handleSaveDraft} 
            className="modern-button secondary"
            disabled={isSavingDraft || !formData.postContent.trim()}
          >
            {isSavingDraft ? "Saving..." : (isEditingDraft ? "Update Draft" : "Save as Draft")}
          </button>
          <button 
            onClick={handleSubmit}
            type="button"
            className="modern-button primary"
            disabled={isSubmitting || !formData.postContent.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Now"}
          </button>
        </div>
      </header>

      <div className="editor-main-vertical">
        <div className="editor-content">
          <textarea 
            className="editor-textarea"
            id="postContent"
            name="postContent"
            value={formData.postContent}
            onChange={handleContentChange}
            placeholder="What would you like to share today? Use ##[PROMPT] for inline Gemini prompts"
            required
            disabled={isSubmitting}
          ></textarea>
          <div className="character-count">
            <span className={characterCount > 280 ? "text-danger" : ""}>
              {characterCount}
            </span>{" "}
            / 280 characters
          </div>
        </div>
        
        {/* Schedule Section (conditionally shown) */}
        {showSchedule && (
          <div className="schedule-section">
            <h3>Schedule Your Post</h3>
            <div className="schedule-row">
              <div className="schedule-item">
                <label htmlFor="postDate">Date</label>
                <input
                  type="date"
                  id="postDate"
                  name="postDate"
                  className="form-control"
                  value={formData.postDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, postDate: e.target.value }))}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="schedule-item">
                <label htmlFor="postTime">Time</label>
                <input
                  type="time"
                  id="postTime"
                  name="postTime"
                  className="form-control"
                  value={formData.postTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, postTime: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Platform Selection */}
        <div className="platform-section">
          <h3>Select Platforms</h3>
          <div className="platforms">
            <div 
              className={`platform-option ${formData.platforms.includes("linkedin") ? "selected" : ""}`}
              data-platform="linkedin"
              onClick={() => !isSubmitting && handlePlatformToggle("linkedin")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span>LinkedIn</span>
            </div>
            <div 
              className={`platform-option ${formData.platforms.includes("twitter") ? "selected" : ""}`}
              data-platform="twitter"
              onClick={() => !isSubmitting && handlePlatformToggle("twitter")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
              <span>Twitter</span>
            </div>
            <div 
              className={`platform-option ${formData.platforms.includes("facebook") ? "selected" : ""}`}
              data-platform="facebook"
              onClick={() => !isSubmitting && handlePlatformToggle("facebook")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Facebook</span>
            </div>
            <div 
              className={`platform-option ${formData.platforms.includes("instagram") ? "selected" : ""}`}
              data-platform="instagram"
              onClick={() => !isSubmitting && handlePlatformToggle("instagram")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#FFDC80" }} />
                    <stop offset="25%" style={{ stopColor: "#FCAF45" }} />
                    <stop offset="50%" style={{ stopColor: "#F77737" }} />
                    <stop offset="75%" style={{ stopColor: "#F56040" }} />
                    <stop offset="100%" style={{ stopColor: "#C13584" }} />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="1" fill="none"></path>
                <circle cx="17.5" cy="6.5" r="1.5" fill="white"></circle>
              </svg>
              <span>Instagram</span>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="editor-tools">
          <div className="tools-section">
            <h3>Smart Drafting Co-pilot</h3>
            <div className="ai-tools">
              <button 
                className={`ai-tool-button ${activeAITool === 'tone' ? 'active' : ''}`}
                onClick={() => setActiveAITool('tone')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                Analyze Tone
              </button>
              <button 
                className={`ai-tool-button ${activeAITool === 'hashtags' ? 'active' : ''}`}
                onClick={() => setActiveAITool('hashtags')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9h16M4 15h16M10 3v18M14 3v18"></path>
                </svg>
                Suggest Hashtags
              </button>
              <button 
                className={`ai-tool-button ${activeAITool === 'readability' ? 'active' : ''}`}
                onClick={() => setActiveAITool('readability')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Check Readability
              </button>
              <button 
                className={`ai-tool-button ${activeAITool === 'generate' ? 'active' : ''}`}
                onClick={async () => {
                  setIsGenerating(true);
                  try {
                    const response = await axios.post('/api/gemini/generate', {
                      prompt: formData.postContent,
                      files: [],
                      history: []
                    });

                    if (response.data.success) {
                      setFormData(prev => ({
                        ...prev,
                        postContent: response.data.content
                      }));
                      setCharacterCount(response.data.content.length);
                    }
                  } catch (error) {
                    console.error('Error generating draft:', error);
                    setSubmitError('Failed to generate draft. Please try again.');
                  } finally {
                    setIsGenerating(false);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-5"></path>
                  <path d="M15 9H9"></path>
                  <path d="M15 12H9"></path>
                  <path d="M15 15H9"></path>
                </svg>
                Generate Draft
              </button>
            </div>
          </div>
          
          {aiSuggestion && (
            <div className="ai-suggestion">
              <h4>AI Suggestion</h4>
              <div className="suggestion-content">
                {aiSuggestion}
              </div>
            </div>
          )}
          
          <div className="tools-section stats-section">
            <h3>Content Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Word Count:</span>
              <span className="stat-value">{formData.postContent.split(/\s+/).filter(Boolean).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Character Count:</span>
              <span className="stat-value">{formData.postContent.length}</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
            {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="success-message" style={{ color: 'green', marginTop: '15px' }}>
            Post successfully published!
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentEditor;
