import React, { useState } from 'react';
import styles from '../stylesheets/CreateAccount.module.css';
import { Message } from './message';

const CreateAccount = ({ onAccountCreationAndLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); 
    const [messageType, setMessageType] = useState(0); 
    const [showMessage, setShowMessage] = useState(false); 

    const loginAfterAccountCreation = async () => {
        try {
            const loginResponse = await fetch('http://localhost:8000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                console.log("Logged in successfully");
                console.log(loginData.username);
                onAccountCreationAndLogin(loginData.user.username); // Call the onLogin prop function to handle post-login UI update
            } else {
                // Handle login failure here
                console.error('Login failed after account creation:', loginData.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error logging in after account creation', error);
        }
    };

    const hideMessage = () => {
        setShowMessage(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate the inputs
        // Email validation can be added here if needed
        if (password !== verifyPassword) {
            setMessage('Passwords do not match');
            setMessageType(1); 
            setShowMessage(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });
            const data = await response.json();

            if (response.ok) {
                console.log("Account creation successful:", data.message);
                await loginAfterAccountCreation(); // Automatically log in after account creation
            } else {
                setMessage(data.message || 'Account creation failed');
                setMessageType(1); 
                setShowMessage(true);
            }
        } catch (error) {
            const regex = /"([^"]+)"/;
            console.log(error.message);
            const matches = regex.exec(error.message);
            if (matches && matches[1]) {
                setMessage(matches[1]);
                if(matches[1].includes('Username')) {
                    setMessage("Username already exists");
                }
            } else {
                setMessage('Account creation error');
            }
            
            setMessageType(1); 
            setShowMessage(true);
        }
    };

    return (
        <div className={styles.createAccountContainer}>
            <h2 className={styles.formTitle}>Create Account</h2>
            {showMessage && <Message message={message} messageType={messageType} onHide={hideMessage} />}
            <form onSubmit={handleSubmit} className={styles.accountForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.formLabel}>Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formLabel}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="verifyPassword" className={styles.formLabel}>Verify Password:</label>
                    <input
                        type="password"
                        id="verifyPassword"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                <button type="submit" className={styles.submitButton}>Create Account</button>
            </form>
        </div>
    );
};

export default CreateAccount;
