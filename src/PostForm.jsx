import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './styles.css';

const PostForm = () => {
  // Local state for form data
  const [formData, setFormData] = useState({
    postContent: "",
    platforms: [],
    postDate: "",
    postTime: ""
  });

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Character count state
  const [characterCount, setCharacterCount] = useState(0);
  const toastRef = useRef(null);

  // Endpoint to post data
  const ZAPIER_ENDPOINT = "https://hooks.zapier.com/hooks/catch/22402606/202waxr/";

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

  // Generate draft using Gemini
  const handleGenerateDraft = async () => {
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
  };

  // Handle platform selection
  const handlePlatformSelection = (platform) => {
    setFormData((prevState) => {
      const platforms = [...prevState.platforms];
      
      if (platforms.includes(platform)) {
        const index = platforms.indexOf(platform);
        platforms.splice(index, 1);
      } else {
        platforms.push(platform);
      }
      
      return {
        ...prevState,
        platforms,
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Process any inline prompts before submitting
      const processedContent = await processInlinePrompts(formData.postContent);
      
      const dataToSubmit = {
        ...formData,
        postContent: processedContent
      };

      const response = await axios.post(ZAPIER_ENDPOINT, dataToSubmit);
      
      if (response.status === 200) {
        setSubmitSuccess(true);
        setFormData({
          postContent: "",
          platforms: [],
          postDate: "",
          postTime: ""
        });
        setCharacterCount(0);
        
        // Show success message
        if (toastRef.current) {
          toastRef.current.style.display = "block";
          setTimeout(() => {
            if (toastRef.current) {
              toastRef.current.style.display = "none";
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setSubmitError("Failed to submit post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update toast reference when component mounts
  useEffect(() => {
    toastRef.current = document.getElementById("successToast");
  }, []);

  return (
    <div className="card">
      <form id="socialMediaForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="postContent">Post Content</label>
          <textarea
            id="postContent"
            name="postContent"
            value={formData.postContent}
            onChange={handleChange}
            placeholder="Write your post content here... Use ##[PROMPT] for inline Gemini prompts"
            required
          />
          <div className="character-count">{characterCount} characters</div>
          <div className="button-group">
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="generate-button"
            >
              {isGenerating ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Select Platforms</label>
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

        <div className="form-group">
          <label>Post Preview</label>
          <div className="preview-card">
            <div id="previewContent">
              {formData.postContent}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Schedule</label>
          <div className="schedule-row">
            <div className="form-group">
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
            <div className="form-group">
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
          </div>
        </div>

        {submitError && (
          <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
            {submitError}
          </div>
        )}

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Now'}
        </button>
        
        {submitSuccess && (
          <div className="success-message" style={{ color: 'green', marginTop: '15px' }}>
            Post successfully published!
          </div>
        )}
      </form>
    </div>
  );
};

export default PostForm;
