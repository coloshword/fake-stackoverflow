import React, { useState } from 'react';
import LoginScreen from './loginscreen'; // Import LoginComponent
import CreateAccount from './createaccount';

const HomeScreen = ({onLoggedIn}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);

    const handleCreateAccountClick = () => {
        setShowLogin(false);
        setShowCreateAccount(true);
    };

    const handleLoginClick = () => {
        setShowLogin(true);
        setShowCreateAccount(false);
    };
    const handleSuccessfulLogin = (username) => {
        onLoggedIn(username); // Call the passed function when login is successful
    };

    const handleAccountCreationAndLogin = (username) => {
        onLoggedIn(username); // Transition to main view after account creation and login
    };

    if (showCreateAccount) {
        return <CreateAccount onAccountCreationAndLogin={handleAccountCreationAndLogin} />;
    }

    if (showLogin) {
        return <LoginScreen onCreateAccount={handleCreateAccountClick} onLoginSuccess={handleSuccessfulLogin} />;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Fake StackOverflow</h1>
            <p>Your go-to hub for coding solutions and community discussions.</p>
            <p>Join us to share knowledge and grow your development skills!</p>
            
            <button 
                style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
                onClick={handleLoginClick} // Add onClick handler for login
            >
                Login
            </button>
            <button 
                style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
                onClick={handleCreateAccountClick}
            >
                Create Account
            </button>
            <button 
                style={{ padding: '10px 20px', fontSize: '16px' }}
                onClick={handleCreateAccountClick}
            >
                Browse as Guest
            </button>
        </div>
    );
}

export default HomeScreen;
