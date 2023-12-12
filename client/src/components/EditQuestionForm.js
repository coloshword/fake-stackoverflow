import React, {useEffect} from 'react';
import axios from 'axios';


function EditQuestionForm({ question, onQuestionUpdated, refreshQuestions }) {
    const [title, setTitle] = React.useState("");
    const [text, setText] = React.useState("");
    console.log(question);

    useEffect(() => {
        // Initialize form fields with question data if question object is provided
        if (question) {
            setTitle(question.title);
            setText(question.text);
        }
    }, [question]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = question._id
        // Prepare the question data
        const questionData = {
            id,
            title,
            text
        };
        console.log(questionData)

        try {
            // Determine whether to post a new question or update an existing one
            const url = `http://localhost:8000/api/questions/edit/${question._id}`;
            const method = 'patch';

            const response = await axios({ url, method, data: questionData });
            console.log(response.data);
            setTitle("");
            setText("");

            console.log("Question updated" );
            if (onQuestionUpdated) onQuestionUpdated();
            // onSubmit();
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
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        rows={4} // You can adjust the number of rows as needed
                    ></textarea>
                </div>
                <button className="submit-button" type="submit">Post Question</button>
            </form>
            <p className="mandatory-field-note">*indicates mandatory field</p>
        </div>
    );
}

export default EditQuestionForm;
