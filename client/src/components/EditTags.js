import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

function EditTagForm({ tag, onTagUpdated }) {
    const [tagName, setTagName] = useState("");
    const { username } = useAuth();


    useEffect(() => {
        if (tag) {
            setTagName(tag.name);
        }
    }, [tag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const tagData = {
            name: tagName,
            username: username
        };

        try {
            const url = `http://localhost:8000/api/tags/edit/${tag._id}`;
            await axios.patch(url, tagData);

            if (onTagUpdated) onTagUpdated();
        } catch (error) {
            console.error('Error updating tag:', error);
        }
    };

    return (
        <div className="tag-editing">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="tagText">Edit Tag:</label>
                    <textarea 
                        id="tagText" 
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        required
                        rows={4}
                    ></textarea>
                </div>
                <button className="submit-button" type="submit">Update Tag</button>
            </form>
        </div>
    );
}

export default EditTagForm;
