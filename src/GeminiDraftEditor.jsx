import React, { useState, useRef } from 'react';
import axios from 'axios';
import './GeminiDraftEditor.css';

const GeminiDraftEditor = () => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError('');
    
    try {
      const uploadedFilesArray = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        setIsGenerating(true);
        const response = await axios.post('/api/gemini/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          uploadedFilesArray.push(response.data.file);
        }
      }
      
      setUploadedFiles([...uploadedFiles, ...uploadedFilesArray]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Error uploading file: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle prompt submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt && uploadedFiles.length === 0) {
      setError('Please enter a prompt or upload a file');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      // Add user message to chat history
      const userMessage = {
        role: 'user',
        parts: [],
      };
      
      // Add file data if available
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          userMessage.parts.push({
            inlineData: {
              data: file.data,
              mimeType: file.mimeType
            },
          });
        }
      }
      
      // Add text prompt if available
      if (prompt) {
        userMessage.parts.push({ text: prompt });
      }
      
      // Add to history
      const updatedHistory = [...chatHistory, userMessage];
      
      // Make API request
      const response = await axios.post('/api/gemini/generate', {
        prompt,
        files: uploadedFiles,
        history: updatedHistory,
      });
      
      if (response.data.success) {
        // Update content
        setContent(response.data.content);
        
        // Add model response to chat history
        const modelMessage = {
          role: 'model',
          parts: [{ text: response.data.content }],
        };
        
        setChatHistory([...updatedHistory, modelMessage]);
        
        // Clear prompt and uploaded files for next interaction
        setPrompt('');
        setUploadedFiles([]);
      } else {
        setError('Failed to generate content');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(`Error generating content: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear chat history and start over
  const handleClearHistory = () => {
    setChatHistory([]);
    setContent('');
    setPrompt('');
    setUploadedFiles([]);
    setError('');
  };

  // Copy content to clipboard
  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  return (
    <div className="gemini-draft-editor">
      <h2>Gemini Draft Editor</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="editor-container">
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="file-upload">
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                disabled={isGenerating}
              >
                Upload File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isGenerating}
              />
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <p>Uploaded Files:</p>
                  <ul>
                    {uploadedFiles.map((file, index) => (
                      <li key={index}>{file.displayName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={5}
              disabled={isGenerating}
            />
            
            <button 
              type="submit" 
              disabled={isGenerating || (!prompt && uploadedFiles.length === 0)}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          </form>
        </div>
        
        <div className="output-section">
          <div className="output-header">
            <h3>Generated Content</h3>
            <div className="output-actions">
              <button onClick={handleCopyContent} disabled={!content}>Copy</button>
              <button onClick={handleClearHistory}>Clear History</button>
            </div>
          </div>
          
          <div className="output-content">
            {content ? (
              <div className="content-display">
                {content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="placeholder-text">
                Generated content will appear here
              </div>
            )}
          </div>
        </div>
      </div>
      
      {chatHistory.length > 0 && (
        <div className="chat-history">
          <h3>Chat History</h3>
          <div className="history-messages">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`history-message ${message.role === 'user' ? 'user-message' : 'model-message'}`}
              >
                <div className="message-role">{message.role === 'user' ? 'You' : 'Gemini'}</div>
                <div className="message-content">
                  {message.parts.map((part, partIndex) => (
                    <div key={partIndex}>
                      {part.text && (
                        <div className="message-text">
                          {part.text.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                      {part.inlineData && (
                        <div className="message-file">
                          [File: {part.inlineData.mimeType}]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiDraftEditor;
