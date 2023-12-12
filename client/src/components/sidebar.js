import React from 'react';
import { useAuth } from './AuthContext'; // Import useAuth hook


const Sidebar = ({ selectedTab, handleTabChange, onBackToHome }) => {
    const { logOut, username } = useAuth();
    const handleLogoutOrHome = () => {
        if (username) {
            logOut();
            console.log("Logged out");
        } else {
            onBackToHome(); // Call the passed callback function for guests
        }
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
                {username && (
                    <button 
                        className={`transparent-button ${selectedTab === 'profile' ? 'selected' : ''}`}
                        id="profileButton"
                        onClick={() => handleTabChange('profile')}
                    >
                        Profile
                    </button>
                )}

                {username ? (
                    <button 
                        className="transparent-button"
                        id="logoutButton"
                        onClick={handleLogoutOrHome}
                        style={{ alignSelf: 'center', margin: '20px 0' }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                ) : (
                    <button 
                        className="transparent-button"
                        id="backHomeButton"
                        onClick={handleLogoutOrHome}
                        style={{ alignSelf: 'center', margin: '20px 0' }}
                    >
                        <i className="fas fa-home"></i> Back to Home
                    </button>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
