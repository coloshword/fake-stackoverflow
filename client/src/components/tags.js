import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TagsComponent({ onAskQuestionClick, onTagClick }) {
    const [uniqueTags, setUniqueTags] = useState([]);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Create a function to fetch tags
        const fetchTags = async () => {
            try {
                // Fetch tags from your backend API
                const tagsResponse = await axios.get('http://localhost:8000/api/tags'); // Replace with your backend API endpoint
                const tags = tagsResponse.data;

                // Set the tags state
                setUniqueTags(tags);
                console.log(tags);
            } catch (err) {
                console.error(err);
                // Handle errors here, e.g., display an error message
            }
        };

        // Create a function to fetch questions
        const fetchQuestions = async () => {
            try {
                // Fetch questions from your backend API
                const questionsResponse = await axios.get('http://localhost:8000/api/questions'); // Replace with your backend API endpoint
                const questions = questionsResponse.data;
                setQuestions(questions);

            } catch (err) {
                console.error(err);
                // Handle errors here, e.g., display an error message
            }
        };

        // Call both fetchTags and fetchQuestions when the component mounts
        fetchTags();
        fetchQuestions();
    }, [])

    // Function to count questions for a specific tag ID
  const countQuestionsWithTag = (tagId) => {
        let count = 0;

        questions.forEach((question) => {
        if (question.tags.includes(tagId)) {
            count++;
        }
        });

        return count;
    };

    const handleTagClick = (e, _id) => {
        e.preventDefault();  // Prevents default anchor tag behavior
        console.log("Tag clicked:", _id);

        // Call the onTagClick function passed from the parent component
        if (onTagClick) {
            onTagClick(_id);
        } else {
            console.error("onTagClick function is not defined");
        }
    };
    return (
        <div className="content">
            <div className="question-heading tagsView">
                <div className="tag-options">
                    <div className="tag-counter">
                        {uniqueTags.length} tags
                    </div>
                    <div className="all-tags-sign">
                        All Tags
                    </div>
                    <button 
                        className="ask-questions-button" 
                        id="askTagQuestionButton" 
                        onClick={onAskQuestionClick}
                    >
                        Ask Question
                    </button>
                </div>
            </div>
            <div className="tags-page">
                {uniqueTags.map((tag) => (
                    <div className="tag-page" key={tag._id}>
                    <button 
                        className="link-style " 
                        data-tag={tag.name} 
                        onClick={(e) => handleTagClick(e, tag._id)}
                        // style={{ all the styles to make this button look like a link }}
                    >
                        <h4>{tag.name}</h4>
                    </button>
                    <p style={{ color: 'black' }}> 
                        {countQuestionsWithTag(tag._id)} {countQuestionsWithTag(tag._id) === 1 ? 'question' : 'questions'}
                    </p>
                </div>
                ))}
            </div>
        </div>
    );
}


export default TagsComponent;
