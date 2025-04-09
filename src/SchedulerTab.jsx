import React, { useState } from "react";
import {
  Bell,
  User,
  ChevronLeft,
  Clock,
  Calendar,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import "./SchedulerTab.css";

const SchedulerTab = () => {
  
  const [autoPost, setAutoPost] = useState(false);

  
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  
  const times = ["12 AM", "6 AM", "12 PM", "6 PM"];

  
  const getHeatmapColor = (day, time) => {
    
    if ((day === 4 || day === 5) && (time === 2 || time === 3)) {
      return "heat-level-3";
    }
    
    else if (day >= 1 && day <= 5 && time === 2) {
      return "heat-level-2";
    }
    
    else if ((day === 0 || day === 6) && time === 1) {
      return "heat-level-1";
    }
    
    return "heat-level-0";
  };

  return (
    <div className="scheduler-container">
      <div className="content-area">
        <div className="page-content">
          <h2 className="section-title">Schedule Your Content</h2>
          <p className="page-subtitle">Pick the optimal time to maximize engagement for your content.</p>

          <div className="section">
            <div className="section-header">
              <h3>Best Times to Post</h3>
              <div className="time-filter">
                <button className="dropdown-button">
                  <span>Last 4 weeks</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Heatmap */}
            <div className="heatmap">
              <div className="heatmap-grid">
                <div className="heatmap-cell"></div>
                {days.map((day, i) => (
                  <div key={i} className={`heatmap-day-header ${i === 2 ? "highlight" : ""}`}>
                    {day}
                  </div>
                ))}

                {times.map((time, timeIndex) => (
                  <React.Fragment key={timeIndex}>
                    <div className="heatmap-time">{time}</div>
                    {days.map((_, dayIndex) => (
                      <div 
                        key={dayIndex} 
                        className={`heatmap-cell ${getHeatmapColor(dayIndex, timeIndex)}`}
                        title={`${days[dayIndex]} at ${times[timeIndex]}`}
                      >
                        {dayIndex === 2 && timeIndex === 2 && (
                          <div className="heatmap-tooltip">
                            <p className="tooltip-time">Tuesday, 12:00 PM</p>
                            <p className="tooltip-stats">Highest engagement</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Time Slots */}
          <div className="section">
            <h3>Recommended Time Slots</h3>
            <div className="time-slots">
              {[
                {day: "Tuesday", time: "12:00 PM", level: "High"},
                {day: "Thursday", time: "6:00 PM", level: "Medium"},
                {day: "Friday", time: "6:00 PM", level: "Medium"}
              ].map((slot, index) => (
                <div key={index} className="time-slot">
                  <div className="slot-icon">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="slot-time">{slot.day}, {slot.time}</p>
                    <p className="slot-engagement">{slot.level} Engagement</p>
                  </div>
                </div>
              ))}
              <button className="more-slots-button">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Post Selection */}
          <div className="post-selection">
            <h3 className="selection-title">Select post from drafts</h3>
            <div className="selection-grid">
              <div>
                <div className="dropdown-select">
                  <span className="truncate">How AI Helps Local Business</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="dropdown-select">
                  <span>12:00 PM</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="dropdown-select">
                  <span>LinkedIn</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="auto-post-row">
              <div className="auto-post-label">
                <span className="auto-post-text">Auto-post</span>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={autoPost}
                    onChange={() => setAutoPost(!autoPost)}
                  />
                  <div className={`toggle-track ${autoPost ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </label>
              </div>
              <span className="coming-soon">Coming soon</span>
            </div>
          </div>

          {/* Schedule Button */}
          <button className="schedule-button">
            Schedule Post
          </button>
        </div>
      </div>

      {/* Right Sidebar - Tips */}
      <div className="right-sidebar">
        <h2 className="sidebar-section-title">Scheduling Tips</h2>

        <div className="tips-container">
          <div className="tip-card">
            <div className="tip-content">
              <div className="tip-icon">
                <Clock className="h-4 w-4" />
              </div>
              <p className="tip-text">Your audience is most active Tuesday at 12 PM</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-content">
              <div className="tip-icon">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="tip-text">Consistent posting increases engagement by 31%</p>
            </div>
          </div>
          
          <div className="tip-card">
            <div className="tip-content">
              <div className="tip-icon">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="tip-text">Weekend posts get 15% less engagement for professional content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerTab;