import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Message } from './message'; 

const LoginScreen = ({ onLoginSuccess, onCreateAccount }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(0); // 0 for success, 1 for error
    const [showMessage, setShowMessage] = useState(false);
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

            if (!response.ok) {
                const errorText = await response.text();
                setMessage(errorText);
                setMessageType(1); 
                setShowMessage(true);
                return; 
            }

            const data = await response.json();
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                logIn(data.user.username); // Call logIn with the user data
                onLoginSuccess(data.user.username, false); // false indicates regular user
                setMessage('Logged in successfully');
                setMessageType(0); // Success message type
            } else if (data.users) { 
                onLoginSuccess(username, true); 
                setMessage('Admin logged in successfully');
                setMessageType(0); 
            }
        } catch (error) {
            setMessage('Login error: ' + error.message);
            setMessageType(1); 
            console.error('Login error', error);
        }
        setShowMessage(true);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Login</h2>
            {showMessage && <Message message={message} messageType={messageType} onHide={() => setShowMessage(false)} />}
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
