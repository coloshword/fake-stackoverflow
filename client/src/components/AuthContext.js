// AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);

    const logIn = (username) => {
        console.log("this is the username ", username);
        setIsLoggedIn(true);
        setUsername(username);
    };

    const logOut = () => {
        setIsLoggedIn(false);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
