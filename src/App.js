import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'; 
import ContentEditor from "./ContentEditor"; 
import DraftsTab from "./DraftsTab";
import MyPostsTab from "./MyPostsTab";
import TabNavigation from "./TabNavigation";
import DraftEditor from './DraftEditor'; 
import "./styles.css";

// Helper component to handle query parameters
function MainContent() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('create');
  
  // Effect to handle tab query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['create', 'drafts', 'posts'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'drafts':
        return <DraftsTab />;
      case 'posts':
        return <MyPostsTab />;
      case 'create':
      default:
        return <ContentEditor />; 
    }
  };

  return (
    <>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo">
            <Link to="/">GeoWriter</Link>
          </div>
          <div className="nav-item active">
            <div className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            Content Generator
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            Scheduler
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            Analytics
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            Settings
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="breadcrumb">
            <span>GeoWriter</span>
            <span className="breadcrumb-separator">/</span>
            <span>Publisher</span>
          </div>

          <h1 className="page-title">Publish to Social Media</h1>

          {/* Tab Navigation */}
          <Routes> 
            <Route path="/" element={<MainContent />} />
            <Route path="/edit-draft/:draftId" element={<ContentEditor />} /> 
          </Routes>
        </div>
        
        <div className="toast" id="successToast">
          <div className="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>Post successfully published!</div>
        </div>
      </div>
    </Router>
  );
}

export default App;
