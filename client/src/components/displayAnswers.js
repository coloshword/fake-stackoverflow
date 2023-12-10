import React, { useState, useEffect } from "react";
import AnswerForm from './answerform';
import Comments from './comments';
import axios from 'axios';
import { timeAgo } from "../helpers/timeago";
import { VoteInterface } from "./voteInterface"

const DisplayAnswers = ({ question, onBack, updateAnswers}) => {
    console.log('DisplayAnswers component called');

    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [updatedQuestion, setQuestion] = useState(question);
    const [isLoading, setIsLoading] = useState(true);


    console.log('Before useEffect');
    console.log(updatedQuestion);

    useEffect(() => {
        console.log('useEffect called');
        // Fetch answers initially and whenever question.ansIds changes
        const fetchedAnswers = question.answers;
        console.log(fetchedAnswers);
        const getAnswers = async() => {
            setIsLoading(true);
            try{
                console.log('Making API call'); // Debug: Log before making the API call
                const response = await axios.get('http://localhost:8000/api/answers');
                console.log("Answers fetched:", response.data); // Debug: Log the fetched data
                if (!response.data.length) {
                    console.log("No answers received from API");
                }
                const filteredAnswers = response.data.filter(ans => updatedQuestion.answers.includes(ans._id));
                setAnswers(filteredAnswers);
                console.log('Answers state set'); // Debug: Log after setting the state
                setIsLoading(false);
                updateAnswers(filteredAnswers);
            }catch(err){
                console.error("Error fetching answers:", err); // Debug: Log any errors
            }
        }
        getAnswers();

        return () => {
            console.log('useEffect cleanup'); // Debug: Log when the cleanup function runs
        };
    }, [updatedQuestion]); // Empty dependency array means this runs once after initial render

    const handleAnswerPosted = async (updatedQuestion) => {
        // This function will be triggered after an answer is posted
        setShowAnswerForm(false); // Hide the answer form

        setQuestion(updatedQuestion);

        try {
            const response = await axios.get('http://localhost:8000/api/answers');
            setAnswers(response.data instanceof Array ? response.data : [response.data]);
        } catch (err) {
            console.error("Error fetching updated answers:", err);
        }

        // Fetch updated answers
        
    };

    // Function to handle clicking on the "Answer Question" button
   
    if (showAnswerForm) {
        // When showAnswerForm is true, render only the AnswerForm
        return (
            <AnswerForm
                question={question}
                onAnswerPosted={handleAnswerPosted}
                onAnswerSubmit={() => setShowAnswerForm(false)}
            />
        );
    }
    if (isLoading) {
        return <div>Loading answers...</div>; // Or any other placeholder content
    }
    return (
        <div className="content">
            <div className="card"> 
                <div className="card-body bordered"> 
                <div className="question-display">
                    <VoteInterface questOrAns={updatedQuestion} isQuestion={true}/>
                    <div className="question-stats">
                        <p><span className="answer-count">{updatedQuestion.answers.length}</span> Answers</p>
                        <p><span className="view-count">{updatedQuestion.views}</span> Views</p>
                    </div>
                    <div className="question-content">
                        <h2 className="question-title">{updatedQuestion.title}</h2>
                        <p className="question-text">{updatedQuestion.text}</p>
                    </div>
                    <div className="question-meta">
                        <button className="ask-questions-button" onClick={onBack}>Back to Questions</button>
                        <p className="red-question">{updatedQuestion.ques_by} asked <span className="time-ago">{timeAgo(updatedQuestion.ask_date_time)}</span></p>
                    </div>
                </div>

            {/* Question Comments section */}
            <Comments
                isQuestion={true}
                question = {question} />
                </div>
            </div>
            {/* Assuming answers are part of the question object */}
            <div className="answers-container">
            {updatedQuestion.answers.map(aid => {
                const answer = answers.find(ans => ans._id === aid);

                if (!answer) {
                    console.log(`Answer not found for id: ${aid}`);
                    return null;
                }

                return (
                    <div class="card">
                        <div class="card-body bordered">
                            <div className="answer-comment-wrapper">
                                    <div className="answer-vote-container" key={aid}>
                                        <div className="answer-text-vote-wrapper">
                                            <VoteInterface questOrAns={answer} isQuestion={false}/>
                                            <p className="answer-text">{answer.text}</p>
                                        </div>
                                        <p className="answer-meta" style={{ color: 'green' }}>
                                        {answer.ans_by} answered <span className="time-ago">{timeAgo(answer.ans_date_time)}</span>
                                    </p>
                                    </div>
                                <Comments isQuestion={false} question={answer} />
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
            {/* "Answer Question" button */}
            <div className="answer-question basic-margin">
                <button className="ask-questions-button" onClick={() => setShowAnswerForm(true)}>Answer Question</button>
            </div>
        </div>
    );
}

export default DisplayAnswers;