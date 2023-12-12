import React, { useEffect } from 'react';

const Message = ({ message, messageType, onHide }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onHide();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onHide]);

    const styles = {
        common: {
            color: "white",
            width: "50%",
            position: "absolute",
            padding: "10px",
            textAlign: "center",
            left: "50%",
            transform: "translateX(-50%)", 
        },
        0: { backgroundColor: "green" },   // Success
        1: { backgroundColor: "red" },     // Error
        2: { backgroundColor: "blue" }     // Info
    };

    const combinedStyles = { ...styles.common, ...styles[messageType] };

    return (
        <div style={combinedStyles}>
            {message}
        </div>
    );
};

export { Message };
