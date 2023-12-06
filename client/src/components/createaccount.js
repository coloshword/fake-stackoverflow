import React, { useState } from 'react';

const CreateAccount = ({ onAccountCreationAndLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [email, setEmail] = useState('');

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
                onAccountCreationAndLogin(); // Call the onLogin prop function to handle post-login UI update
            } else {
                // Handle login failure here
                console.error('Login failed after account creation:', loginData.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error logging in after account creation', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate the inputs
        if (password !== verifyPassword) {
            console.error('Passwords do not match');
            return; // Stop the function if the passwords don't match
        }
        // Email validation can be added here if needed

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
                // Handle server-side errors (e.g., username already exists)
                console.error('Account creation failed:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Account creation error', error);
        }
    };

    return (
        <div>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Verify Password:
                        <input
                            type="password"
                            value={verifyPassword}
                            onChange={(e) => setVerifyPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
};

export default CreateAccount;
