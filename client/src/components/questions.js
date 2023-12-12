import React, { useState, useEffect } from 'react';
import AskQuestionForm from './AskQuestionForm';
import DisplayAnswers from './displayAnswers';
import { useAuth } from './AuthContext';
import axios from 'axios';


function DisplayAllQuestions({ selectedTag, setSelectedQuestionId, searchText }) {
    console.log("DisplayAllQuestions component rendering");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]); // State to store answers
    const [tags, setTags] = useState([]); // State to store tags
    const [showForm, setShowForm] = useState(false);
    const [sortType, setSortType] = useState('Newest');
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const { isLoggedIn } = useAuth();

    const parseSearchString = (searchText = '') => {
        const words = searchText.split(/\s+/);
        console.log(words);
        const tagNames = [];
        const nonTagWords = [];
        if(searchText === ''){
            return { tagNames, nonTagWords };
        }

        words.forEach((word) => {
            if (word.startsWith('[') && word.endsWith(']')) {
                // Remove brackets, split by ',' and push to tagNames array in lowercase
                const tagNamesWithoutBrackets = word.substring(1, word.length - 1).toLowerCase();
                tagNames.push(...tagNamesWithoutBrackets.split(']['));
            } else {
                nonTagWords.push(word.toLowerCase());
            }
        });

        return { tagNames, nonTagWords };
    };


    useEffect(() => {
        // Parse the search string to extract tag names and non-tag words
        console.log("SEARCHED TEXT: ", searchText);
        let filteredQuestions = questions;

        

        
            const { tagNames, nonTagWords } = parseSearchString(searchText);


            // Filter questions based on tag names and non-tag words

            let tagQuestions = [];
            let nonTagQuestionsSet = new Set();
            console.log(tagNames.length);
            console.log(nonTagWords.length);
            if (tagNames.length > 0) {
                console.log(tagNames);
                const matchingTags = tags.filter((tag) =>
                    tagNames.includes(tag.name.toLowerCase())
                );
                tagQuestions = questions.filter(question => {
                    const tagsArray = question.tags;
                    return tagsArray.some(tag => matchingTags.some(matchingTag => tag === matchingTag._id));
                });

            }
            console.log(tagQuestions);
            console.log();
            if (nonTagWords.length > 0) {
                for(let i = 0; i < nonTagWords.length; i++){
                    for(let j = 0; j < questions.length; j++){
                        if (
                            questions[j].title.toLowerCase().includes(nonTagWords[i].toLowerCase()) ||
                            questions[j].text.toLowerCase().includes(nonTagWords[i].toLowerCase())
                        ) {
                            nonTagQuestionsSet.add(questions[j]);
                        }
                    }
                }
            }
            let nonTagQuestions = [...nonTagQuestionsSet];

            if(tagQuestions.length > 0 || nonTagQuestions.length > 0){
                console.log("I ENTER");
                filteredQuestions = [...new Set([...tagQuestions, ...nonTagQuestions])];
                console.log(filteredQuestions);
                setFilteredQuestions(filteredQuestions);
            }
            
            console.log(filteredQuestions);
        // Update the filtered questions
        
    
    }, [questions, searchText, answers, selectedTag]);

    useEffect(() => {
        console.log(sortType);
        const sortedQuestions = sortQuestions(filteredQuestions, sortType);
        setFilteredQuestions(sortedQuestions);
    }, [sortType]);

    useEffect(() => {
        if (selectedTag) {
            const filteredByTag = questions.filter(question => question.tags.includes(selectedTag));
            setFilteredQuestions(filteredByTag);
        } else {
            // If there's no selected tag, decide how you want to handle this. 
            // For instance, you might want to show all questions:
            setFilteredQuestions(questions);
        }
    }, [selectedTag, questions]);

    const updateAnswers = (newAnswers) => {
            setAnswers(newAnswers);
    };

    const renderAskQuestionButton = () => {
        if (isLoggedIn) { // Check if the user is logged in
            return (
                <button onClick={() => {/* logic to show AskQuestionForm */}}>
                    Ask Question
                </button>
            );
        }
        return null;
    };


    
    const handleQuestionSubmission = () => {
        // Hide the form and refresh the questions
        setShowForm(false);
        refreshQuestions();
      };

    const refreshQuestions = async () => {
        console.log("refreshQuestions called");
    try {
        const response = await axios.get('http://localhost:8000/api/questions');
        console.log("Questions fetched:", response.data);
        if (!response.data.length) {
            console.log("No questions received from API");
        }
        setQuestions(response.data instanceof Array ? response.data : [response.data]);
        console.log("Questions state should be updated");
        const tagsResponse = await axios.get('http://localhost:8000/api/tags');
        setTags(tagsResponse.data);
    } catch (error) {
            console.error('Error fetching questions: ', error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
        
            try {
                const response = await axios.get('http://localhost:8000/api/answers');
                setAnswers(response.data instanceof Array ? response.data : [response.data]);
                const questionsResponse = await axios.get('http://localhost:8000/api/questions');
                setQuestions(questionsResponse.data);
                const tagsResponse = await axios.get('http://localhost:8000/api/tags');
                setTags(tagsResponse.data);
                setSortType('Newest'); // Set the default sort type here
                setFilteredQuestions(sortQuestions(questionsResponse.data, 'Newest'));
            } catch (err) {
                console.error('Error:', err);
            }
    
        };

        fetchInitialData();
    }, []); // Empty dependency array for initial load only

    const sortQuestions = (questionsToSort, sortType) => {
        let sortedQuestions = [...questionsToSort];
        if(sortType === 'Newest') {
            sortedQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
        } else if(sortType === 'Active') {
            // ... Active sorting logic ...
            console.log(answers);
            sortedQuestions.sort((a, b) => {
                let earliestDateA = findEarliestAnswerDate(a.answers, answers);
                let earliestDateB = findEarliestAnswerDate(b.answers, answers);
                return earliestDateA - earliestDateB;
            });
            console.log(sortedQuestions);
        } else if(sortType === 'Unanswered') {
            // ... Unanswered sorting logic ...
            console.log(answers);
            sortedQuestions.sort((a, b) => {
                if (a.answers.length === 0 && b.answers.length > 0) {
                    return -1; // a comes first
                } else if (a.answers.length > 0 && b.answers.length === 0) {
                    return 1; // b comes first
                } else {
                    return 0; // no change in order
                }
            });
        }
        console.log(sortedQuestions);
        return sortedQuestions;
    };
   

    const handleQuestionClick = async (question) => {
        console.log("Question clicked:", question);

        try {
            // Make a PATCH request to update the view count in the backend
            await axios.patch(`http://localhost:8000/api/questions/${question._id}`);
    
            // Update the view count in the local state
            setQuestions(prevQuestions => prevQuestions.map(q => 
                q._id === question._id ? { ...q, views: q.views + 1 } : q
            ));
    
            // Set the selected question
            setSelectedQuestion(question);
        } catch (err) {
            console.error("Error updating view count:", err);
        }
    };


    const getTagMatch = (question) => {
        return tags.filter(tag => question.tags.includes(tag._id)).map(tag => tag.name);
    };

    const timeAgo = (dateString) => {
        const now = new Date(); // Current time
        const then = new Date(dateString); // Converts ISO string to Date object

        const seconds = Math.round((now - then) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);

        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        } else if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            const formattedHours = then.getHours().toString().padStart(2, '0'); // Ensure two-digit hours
            const formattedMinutes = then.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
            return `${formattedHours}:${formattedMinutes}`;
        } else {
            // Format for dates more than a day old
            const formattedHours = then.getHours().toString().padStart(2, '0'); // Ensure two-digit hours
            const formattedMinutes = then.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
            return `${then.toLocaleString('default', { month: 'long' })} ${then.getDate()}, ${then.getFullYear()} at ${formattedHours}:${formattedMinutes}`;
        }
    };
    
    function findEarliestAnswerDate(answerIds, answers) {
        return answerIds
            .map(id => answers[id] ? new Date(answers[id].ask_date_time) : new Date(0))
            .sort((a, b) => a - b)[0] || new Date(0);
    }

    useEffect(() => {
        console.log("Selected Tag in DisplayAllQuestions: ", selectedTag);
        // Other code dependent on selectedTag
    }, [selectedTag]);

    console.log("Rendering DisplayAllQuestions component");
    console.log("Current questions state:", filteredQuestions);
    return (
        <div className="content">
            {showForm ? (
                <AskQuestionForm onSubmit={handleQuestionSubmission} refreshQuestions={refreshQuestions}/>
            ) : selectedQuestion ? (
                <DisplayAnswers question={selectedQuestion}  onBack={() => setSelectedQuestion(null)} updateAnswers={updateAnswers} />
            ) : (
                <>
                <div className="question-heading questionsView">
                    <div className="question-options">
                    <div className="all-questions-sign">All Questions</div>
                        <div>
                            {isLoggedIn && ( // Conditionally render this button
                                <button
                                    className="ask-questions-button"
                                    id="askQuestionButton"
                                    onClick={() => setShowForm(true)}
                                >
                                    Ask Question
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="question-counter-sorting questionsView">
                    <div className="question-counter">{filteredQuestions.length} questions</div>
                    <div className="sorting-questions">
                        <button id="Newest" onClick={() => setSortType('Newest')}>Newest</button>
                        <button id="Active" onClick={() => setSortType('Active')}>Active</button>
                        <button id="Unanswered" onClick={() => setSortType('Unanswered')}>Unanswered</button>
                    </div>
                    </div>
                </div>
                {filteredQuestions.length === 0 ? (
                    <p>No questions found</p>
                ) : ( Array.isArray(filteredQuestions) &&
                filteredQuestions.map(question => {
                    console.log("Rendering question:", question);
                    const tagMatch = getTagMatch(question);
                    console.log(tagMatch);
                    return (
                        <div
                        className="question"
                        key={question._id}
                        data-qid={question._id}
                        onClick={() => handleQuestionClick(question)}
                        >
                        <div className="question-container">
                            <div className="question-stats">
                            <p><span className="answer-count">{question.answers.length}</span> Answers</p>
                            <p><span className="view-count">{question.views}</span> Views</p>
                            </div>
                            <div className="question-content">
                            <h2>{question.title}</h2>
                            <div className="tags">
                                {tagMatch.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            </div>
                            <div className="question-meta">
                            <p> <span style={{ color: 'red' }} > {question.ques_by} </span> asked <span className="time-ago">{timeAgo(question.ask_date_time)}</span></p>
                            </div>
                        </div>
                        </div>
                    );
                    })
                )}
                </>
            )}
        </div>
    );
}

export default DisplayAllQuestions;
