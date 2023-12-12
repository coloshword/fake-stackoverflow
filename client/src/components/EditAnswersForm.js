import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditAnswerForm({ answer, onAnswerUpdated }) {
    const [answerText, setAnswerText] = useState("");

    useEffect(() => {
        // Initialize form field with answer data if answer object is provided
        if (answer) {
            setAnswerText(answer.text);
        }
    }, [answer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare the answer data
        const answerData = {
            text: answerText
        };

        try {
            const url = `http://localhost:8000/api/answers/edit/${answer._id}`;
            const method = 'patch';

            const response = await axios({ url, method, data: answerData });
            console.log("Answer updated", response.data);
            
            setAnswerText(""); // Clear the form

            if (onAnswerUpdated) onAnswerUpdated(); // Call the update handler
        } catch (error) {
            console.error('Error updating answer: ', error);
        }
    };

    return (
        <div className="answer-editing">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="answerText">Edit Answer:</label>
                    <textarea 
                        id="answerText" 
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        required
                        rows={4}
                    ></textarea>
                </div>
                <button type="submit">Update Answer</button>
            </form>
        </div>
    );
}

export default EditAnswerForm;
