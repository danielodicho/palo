import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.css'; // Ensure styles are imported

function DraftEditor() {
    const { draftId } = useParams(); // Get draft ID from URL
    const [draftContent, setDraftContent] = useState('');
    const [draftTitle, setDraftTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeAITool, setActiveAITool] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const navigate = useNavigate();

    // TODO: Replace with actual fetch logic later
    useEffect(() => {
        console.log(`Fetching draft with ID: ${draftId}`);
        // Simulate fetching draft data
        setTimeout(() => {
            // Mock data based on ID, replace with actual fetch
            const mockTitle = `Draft ${draftId.split('-')[1]}`;
            const mockContent = `This is the content for draft ${draftId}. Time to make it shine with our new modern editor interface!`; 
            setDraftTitle(mockTitle);
            setDraftContent(mockContent);
            setIsLoading(false);
        }, 500);
    }, [draftId]);

    const handleSave = () => {
        // TODO: Implement save logic
        console.log(`Saving draft ${draftId}:`, draftContent);
        alert('Draft saved successfully!');
        // Navigate back to drafts tab after saving
        navigate('/?tab=drafts');
    };

    const handleCancel = () => {
        // Navigate back to drafts tab without saving
        navigate('/?tab=drafts');
    };

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
                <p>Loading your draft...</p>
            </div>
        );
    }

    return (
        <div className="modern-editor-container">
            <header className="editor-header">
                <div className="editor-breadcrumb">
                    <button onClick={handleCancel} className="back-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Drafts
                    </button>
                </div>
                <div className="editor-actions">
                    <button onClick={handleCancel} className="modern-button secondary">Cancel</button>
                    <button onClick={handleSave} className="modern-button primary">Save Draft</button>
                </div>
            </header>

            <div className="editor-main-vertical">
                <div className="editor-content">
                    <input 
                        type="text"
                        className="editor-title-input"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        placeholder="Draft Title"
                    />
                    <textarea 
                        className="editor-textarea"
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        placeholder="Start writing your draft..."
                    />
                </div>
                
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
                        <h3>Draft Statistics</h3>
                        <div className="stat-item">
                            <span className="stat-label">Word Count:</span>
                            <span className="stat-value">{draftContent.split(/\s+/).filter(Boolean).length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Character Count:</span>
                            <span className="stat-value">{draftContent.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DraftEditor;
