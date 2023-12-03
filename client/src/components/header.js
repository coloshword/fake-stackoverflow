import React, { useState } from 'react';

const Header = ({ onSearchInputChange }) => {
    const [searchText, setSearchText] = useState('');

    const handleInputChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearchInputChange(searchText); // Call the parent callback function with the input text
        }
    };

    return (
        <div id="header" className="outlined-margin">
            <div className="title">
                <h1>Fake Stack Overflow</h1>
            </div>
            <div className="search-bar">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Search..."
                    value={searchText} 
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
            </div>
        </div>
    );
}

export default Header;