import React, { useState } from 'react';

const LoginScreen = ({ onLoginSuccess, onCreateAccount }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Update UI or redirect user
            } else {
                // Handle errors
            }

            console.log('Logged in as ' + data.username);
            console.log("LOGIN SUCCESS");
            onLoginSuccess(data.username);
        } catch (error) {
            console.error('Login error', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </label>
                </div>
                <button type="submit">Login</button>
            </form>
            <button onClick={onCreateAccount}>Create Account</button>
        </div>
    );
};

export default LoginScreen;
