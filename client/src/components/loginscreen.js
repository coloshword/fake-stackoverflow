import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginScreen = ({ onLoginSuccess, onCreateAccount }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { logIn } = useAuth();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const route = username === 'admin' ? '/api/admin/login' : '/api/users/login';
            const response = await fetch(`http://localhost:8000${route}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('Logged in as ' + data.user.username);
                logIn(data.user.username); // Call logIn with the user data
                onLoginSuccess(data.user.username, false); // false indicates regular user
            } else if (data.users) { // Specific response structure for admin login
                // Handle admin login
                console.log('Admin logged in', data);
                onLoginSuccess(username, true); // true indicates admin
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
