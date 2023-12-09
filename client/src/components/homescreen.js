import React, { useState } from 'react';
import LoginScreen from './loginscreen'; // Import LoginComponent
import CreateAccount from './createaccount';
import AdminView from './adminView';
import { useAuth } from './AuthContext';
import lebronJames from './lebron.jpeg';
import styles from '/Users/aneeshsurasani/Downloads/CSE316/projectfakeso-team-lemickey/client/src/stylesheets/HomeScreen.module.css';

const HomeScreen = ({onBrowseAsGuest}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [isAdminView, setIsAdminView] = useState(false);
    const { logIn } = useAuth();
    

    const handleCreateAccountClick = () => {
        setShowLogin(false);
        setShowCreateAccount(true);
    };

    const handleLoginClick = () => {
        setShowLogin(true);
        setShowCreateAccount(false);
    };
    const handleSuccessfulLogin = (username) => {
        console.log("line 22: ", username);
        // logIn(username); // Update the global auth state
        if (username === 'admin') 
            setIsAdminView(true); // Set admin view if admin logs in
    }

    const handleUserSelection = (username) => {
        logIn(username); // Log in the selected user
        setIsAdminView(false); // Disable AdminView
    };

    const handleAccountCreationAndLogin = (username) => {
        logIn(username); // Transition to main view after account creation and login
    };

    if (isAdminView) {
        return <AdminView onUserClick={handleUserSelection} />; // Render AdminView if admin is logged in
    }

    if (showCreateAccount) {
        return <CreateAccount onAccountCreationAndLogin={handleAccountCreationAndLogin} />;
    }

    if (showLogin) {
        return <LoginScreen onCreateAccount={handleCreateAccountClick} onLoginSuccess={handleSuccessfulLogin} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Welcome to Fake StackOverflow</h1>
                {/* Add the img tag below the h1 tag */}
                <img src={lebronJames} alt="Descriptive Alt Text" style={{ maxWidth: '100%', height: 'auto' }} />
                <p className={styles.subtitle}>Your go-to hub for coding solutions and community discussions.</p>
                <p className={styles.subtitle}>Join us to share knowledge and grow your development skills!</p>
            </div>
            <button 
                className={`${styles.button} ${styles.mainActionButton}`}
                onClick={handleLoginClick}
            >
                Login
            </button>
            <button 
                className={`${styles.button} ${styles.mainActionButton}`}
                onClick={handleCreateAccountClick}
            >
                Create Account
            </button>
            <button 
                className={`${styles.button} ${styles.mainActionButton}`}
                onClick={onBrowseAsGuest}
            >
                Browse as Guest
            </button>
        </div>
    );
}

export default HomeScreen;
