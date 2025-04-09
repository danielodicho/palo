import React from "react";

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "create", label: "Create Post" },
    { id: "drafts", label: "Drafts" },
    { id: "posts", label: "My Posts" }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

export default TabNavigation;
