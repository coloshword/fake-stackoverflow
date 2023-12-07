import React from 'react';
import axios from 'axios';


function AskQuestionForm({ onSubmit, refreshQuestions }) {
    const [title, setTitle] = React.useState("");
    const [details, setDetails] = React.useState("");
    const [tags, setTags] = React.useState("");
    const [username, setUsername] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare the question data
        const questionData = {
            title,
            details,
            tags: tags.split(/\s+/), // Split tags by whitespace into an array
            askedBy: username
        };

        try {
            const response = await axios.post('http://localhost:8000/api/questions', questionData);
            console.log(response.data);
            setTitle("");
            setDetails("");
            setTags("");
            setUsername("");

            console.log("questions is added to backend");
            onSubmit();
        } catch (error) {
            console.error('Error posting question: ', error);
        }
    };

    return (
        <div className="question-heading">
            <form id="questionForm" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="question-label" htmlFor="questionTitle">Question title*</label>
                    <label className="limit">Limit to 100 characters</label>
                    <input 
                        className="input-text" 
                        type="text" 
                        id="questionTitle" 
                        placeholder="Question Title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required 
                        maxLength="100"
                    />
                </div>
                <div className="form-group">
                    <label className="question-label" htmlFor="questionDetails">Question Text*</label>
                    <span className="add-details">Add details</span>
                    <textarea 
                        className="input-details" 
                        id="questionDetails" 
                        placeholder="Question Details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        required
                        rows={4} // You can adjust the number of rows as needed
                    ></textarea>
                </div>
                <div className="form-group">
                    <label className="question-label" htmlFor="questionTags">Tags*</label>
                    <span className="add-keyw">Add keywords separated by whitespace</span>
                    <input 
                        className="input-text" 
                        type="text" 
                        id="questionTags" 
                        placeholder="Tags" 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        maxLength="50"
                    />
                </div>
                <div className="form-group">
                    <label className="question-label" htmlFor="username">Username*</label>
                    <input 
                        className="input-text" 
                        type="text" 
                        id="username" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-button" type="submit">Post Question</button>
            </form>
            <p className="mandatory-field-note">*indicates mandatory field</p>
        </div>
    );
}

export default AskQuestionForm;
