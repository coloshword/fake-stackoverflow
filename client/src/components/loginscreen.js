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
            if (data.user) {
                // Assuming you want to store the entire user object in local storage
                // Be cautious about storing sensitive data in local storage
                localStorage.setItem('user', JSON.stringify(data.user));
    
                console.log('Logged in as ' + data.user.questions);
                console.log("LOGIN SUCCESS");
                onLoginSuccess(data.user.questions);
            }
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
