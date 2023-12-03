import React from 'react';

const Sidebar = ({ selectedTab, setSelectedTab, handleTabChange }) => {

    return (
        <div className="sidebar">
            <div>
                <button 
                    className={`transparent-button ${selectedTab === 'questions' ? 'selected' : ''}`}
                    id="questionsButton"
                    onClick={() => handleTabChange('questions')}
                    >
                    Questions
                </button>
                <button 
                    className={`transparent-button ${selectedTab === 'tags' ? 'selected' : ''}`}
                    id="tagsButton"
                    onClick={() => handleTabChange('tags')}
                >
                    Tags
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
