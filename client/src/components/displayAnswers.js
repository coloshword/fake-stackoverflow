import React, { useState, useEffect } from "react";
import AnswerForm from './answerform';
import Comments from './comments';
import axios from 'axios';
import { timeAgo } from "../helpers/timeago";
import { VoteInterface } from "./voteInterface"
import { useAuth } from './AuthContext';


const DisplayAnswers = ({ question, onBack, updateAnswers}) => {
    console.log('DisplayAnswers component called');

    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [updatedQuestion, setQuestion] = useState(question);
    const [isLoading, setIsLoading] = useState(true);
    const [answerPage, setAnswerPage] = useState(0);
    const { username } = useAuth();


    console.log('Before useEffect');
    console.log(updatedQuestion);

    useEffect(() => {
        console.log('useEffect called');
        // Fetch answers initially and whenever question.ansIds changes
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

    const renderAnswer = (answer) => {
        if (!answer) {
            console.log(`Answer not found`);
            return null;
        }
        return (
            <div className="card" key={answer._id}>
                <div className="card-body bordered">
                    <div className="answer-comment-wrapper">
                        <div className="answer-vote-container">
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
    };

    const handleLeft = () => {
        let pageMin = 0;
        if (answerPage > pageMin) {
            setAnswerPage(answerPage - 1);
        }
    };
    
    const handleRight = () => {
        let pageMax = Math.floor((answers.length - 1) / 5);
        if (answerPage < pageMax) {
            setAnswerPage(answerPage + 1);
        }
    };

    const switchAnswerPageBtn = () => {
        let pageMin = 0;
        let pageMax = Math.floor((answers.length - 1) / 5);
        if(pageMax < 0) {
            pageMax = 0;
        }
        console.log("PAGE MAX " + pageMax)
        return (
            <div className="comment-switch-container">
                <button 
                    className={`comment-switch-left ${answerPage === pageMin ? 'disabled-button' : ''}`}
                    onClick={handleLeft}
                    disabled={answerPage === pageMin}>
                </button>
                <span className="comment-page">{answerPage}</span>
                <button 
                    className={`comment-switch-right ${answerPage === pageMax ? 'disabled-button' : ''}`}
                    onClick={handleRight}
                    disabled={answerPage === pageMax}>
                </button>
            </div>
        );
    };

    const renderAnswers = (page) => {
        const answersPerPage = 5;
        const startIndex = page * answersPerPage;
        const endIndex = startIndex + answersPerPage;
        const answersToRender = [...updatedQuestion.answers].reverse().slice(startIndex, endIndex);
    
        return answersToRender.map(answerId => {
            const answer = answers.find(ans => ans._id === answerId);
            return renderAnswer(answer);
        });
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
        return <div>Loading answers...</div>; 
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
            <div className="answers-container">
            <div className="switch-page-title-answers-container">
                <h2 style={{ color: 'green', lineHeight:'100%'}}> Answers </h2>
                <div className="together-div">
                    Displaying answers page: 
                    <span style={{ position: 'relative', top: '-1px', left:'10px'}}>
                        {switchAnswerPageBtn()}
                    </span>
                </div>

            </div>
                {renderAnswers(answerPage)}
            </div>
            {/* "Answer Question" button */}
            {username && (<div className="answer-question basic-margin">
                <button className="ask-questions-button" onClick={() => setShowAnswerForm(true)}>Answer Question</button>
            </div>)}
        </div>
    );
}

export default DisplayAnswers;