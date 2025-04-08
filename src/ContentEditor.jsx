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
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Character count state
  const [characterCount, setCharacterCount] = useState(0);

  // Endpoint to post data
  const ZAPIER_ENDPOINT = "https://hooks.zapier.com/hooks/catch/22402606/202waxr/";

  // Load draft if editing an existing one
  useEffect(() => {
    if (draftId) {
      console.log(`Loading draft: ${draftId}`);
      // Simulate fetching draft data
      // TODO: Replace with actual API call to get draft data
      setTimeout(() => {
        const mockContent = `This is the content for draft ${draftId}. Time to make it shine with our new modern editor interface!`;
        setFormData(prev => ({
          ...prev,
          postContent: mockContent
        }));
        setCharacterCount(mockContent.length);
        setIsLoading(false);
      }, 500);
    }

    // Update toast reference when component mounts
    toastRef.current = document.getElementById("successToast");
  }, [draftId]);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Update character count for post content
    if (name === "postContent") {
      setCharacterCount(value.length);
    }
  };

  // Handle platform selection
  const handlePlatformSelection = (platform) => {
    setFormData((prevState) => {
      const platforms = [...prevState.platforms];
      
      if (platforms.includes(platform)) {
        // Remove platform if already selected
        const index = platforms.indexOf(platform);
        platforms.splice(index, 1);
      } else {
        // Add platform if not selected
        platforms.push(platform);
      }
      
      return {
        ...prevState,
        platforms
      };
    });
  };

  // Save as draft
  const saveDraft = () => {
    console.log("Saving as draft:", formData);
    // TODO: Implement API call to save draft
    
    alert("Draft saved successfully!");
    // Navigate to drafts tab
    navigate('/?tab=drafts');
  };

  // Publish now
  const publishNow = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Prepare data to send
      const dataToSend = {
        content: formData.postContent,
        platforms: formData.platforms,
        scheduledDateTime: null // Publish immediately
      };

      console.log("Publishing now:", dataToSend);

      // Use a proxy server or CORS-anywhere to bypass CORS restrictions
      // For development purposes, we'll use a direct fetch with mode: 'no-cors'
      const response = await fetch(ZAPIER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        mode: 'no-cors' // This prevents CORS errors but you won't get response data
      });
      
      console.log("Response from Zapier (limited due to no-cors):", response);
      
      // Since we're using no-cors, we won't get a proper response
      // So we'll assume success if no error is thrown
      setSubmitSuccess(true);

      // Show success toast
      if (toastRef.current) {
        toastRef.current.classList.add("show");
        setTimeout(() => {
          if (toastRef.current) {
            toastRef.current.classList.remove("show");
          }
        }, 3000);
      }

      // Reset the form
      setFormData({
        postContent: "",
        platforms: ["linkedin"],
        postDate: "",
        postTime: ""
      });
      setCharacterCount(0);
      
    } catch (error) {
      console.error("Error publishing:", error);
      setSubmitError("There was an error publishing your content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Schedule for later
  const schedulePost = async () => {
    if (!formData.postDate || !formData.postTime) {
      alert("Please select both date and time for scheduling.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Prepare data to send
      const dataToSend = {
        content: formData.postContent,
        platforms: formData.platforms,
        scheduledDateTime: `${formData.postDate}T${formData.postTime}`
      };

      console.log("Scheduling post:", dataToSend);

      // Use a proxy server or CORS-anywhere to bypass CORS restrictions
      const response = await fetch(ZAPIER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        mode: 'no-cors'
      });
      
      console.log("Response from Zapier (limited due to no-cors):", response);
      
      // Since we're using no-cors, we won't get a proper response
      // So we'll assume success if no error is thrown
      setSubmitSuccess(true);

      // Show success toast
      if (toastRef.current) {
        toastRef.current.classList.add("show");
        setTimeout(() => {
          if (toastRef.current) {
            toastRef.current.classList.remove("show");
          }
        }, 3000);
      }

      // Reset the form
      setFormData({
        postContent: "",
        platforms: ["linkedin"],
        postDate: "",
        postTime: ""
      });
      setCharacterCount(0);
      setShowSchedule(false);
      
    } catch (error) {
      console.error("Error scheduling post:", error);
      setSubmitError("There was an error scheduling your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Tool functionality
  const activateAITool = (tool) => {
    setActiveAITool(tool);
    
    // Simulate AI processing
    setAiSuggestion('Analyzing your content...');
    
    setTimeout(() => {
      // Mock AI suggestions based on the selected tool
      let suggestion = '';
      switch(tool) {
        case 'tone':
          suggestion = 'Your content has a professional tone. Consider adding more personal elements to increase engagement.';
          break;
        case 'hashtags':
          suggestion = 'Suggested hashtags: #ContentStrategy #SocialMediaTips #DigitalMarketing #GrowthHacking';
          break;
        case 'readability':
          suggestion = 'Readability score: Good (Grade 8). Your content is accessible to a broad audience.';
          break;
        default:
          suggestion = '';
      }
      setAiSuggestion(suggestion);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="modern-loading">
        <div className="loading-spinner"></div>
        <p>Loading your content...</p>
      </div>
    );
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
            onClick={saveDraft} 
            className="modern-button secondary"
            disabled={isSubmitting || !formData.postContent.trim()}
          >
            Save as Draft
          </button>
          <button 
            onClick={publishNow} 
            className="modern-button primary"
            disabled={isSubmitting || !formData.postContent.trim()}
          >
            Publish Now
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
            onChange={handleChange}
            placeholder="What would you like to share today?"
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="schedule-item">
                <button 
                  onClick={schedulePost} 
                  className="modern-button primary schedule-button"
                  disabled={isSubmitting || !formData.postContent.trim() || !formData.postDate || !formData.postTime}
                >
                  Schedule Post
                </button>
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
              onClick={() => !isSubmitting && handlePlatformSelection("linkedin")}
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
              onClick={() => !isSubmitting && handlePlatformSelection("twitter")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
              <span>Twitter</span>
            </div>
            <div 
              className={`platform-option ${formData.platforms.includes("facebook") ? "selected" : ""}`}
              data-platform="facebook"
              onClick={() => !isSubmitting && handlePlatformSelection("facebook")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Facebook</span>
            </div>
            <div 
              className={`platform-option ${formData.platforms.includes("instagram") ? "selected" : ""}`}
              data-platform="instagram"
              onClick={() => !isSubmitting && handlePlatformSelection("instagram")}
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
                onClick={() => activateAITool('tone')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                Analyze Tone
              </button>
              <button 
                className={`ai-tool-button ${activeAITool === 'hashtags' ? 'active' : ''}`}
                onClick={() => activateAITool('hashtags')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9h16M4 15h16M10 3v18M14 3v18"></path>
                </svg>
                Suggest Hashtags
              </button>
              <button 
                className={`ai-tool-button ${activeAITool === 'readability' ? 'active' : ''}`}
                onClick={() => activateAITool('readability')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Check Readability
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
