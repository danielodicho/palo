import React from "react";
import { useNavigate } from 'react-router-dom';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL with query parameter
    navigate(`/?tab=${tab}`);
  };

  const tabs = [
    { id: "create", label: "Create Post" },
    { id: "drafts", label: "Drafts" },
    { id: "posts", label: "My Posts" }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => handleTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default TabNavigation;
