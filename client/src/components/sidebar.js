import React from 'react';
import { useAuth } from './AuthContext'; // Import useAuth hook


const Sidebar = ({ selectedTab, setSelectedTab, handleTabChange }) => {
    const { logOut } = useAuth();
    const handleLogout = () => {
        logOut();
        // Clear user authentication data
        console.log("Logged out");
    }


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
                <button 
                className="transparent-button"
                id="logoutButton"
                onClick={handleLogout}
                style={{ alignSelf: 'center', margin: '20px 0' }} // Centers the button in the flex container
            >
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            </div>
        </div>
    );
}

export default Sidebar;
