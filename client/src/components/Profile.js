import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import EditQuestionForm from './EditQuestionForm';
import EditAnswerForm from './EditAnswersForm';
import EditTags from './EditTags';

function Profile() {
    const [userQuestions, setUserQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [userTags, setUserTags] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editingAnswer, setEditingAnswer] = useState(null);
    const [editingTag, setEditingTag] = useState(null);
    const { username } = useAuth();
    console.log(username);

    const fetchUserQuestions = async () => {
        if (username) {
            try {
                const response = await axios.get(`http://localhost:8000/api/questions/user/${username}`);
                setUserQuestions(response.data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        }
    };

    const fetchUserAnswers = async () => {
        if (username) {
            try {
                const response = await axios.get(`http://localhost:8000/api/answers/user/${username}`);
                setUserAnswers(response.data);
            } catch (error) {
                console.error('Error fetching answers:', error);
            }
        }
    };

    const fetchUserTags = async () => {
        if (username) {
            try {
                const response = await axios.get(`http://localhost:8000/api/tags/user/${username}`);
                setUserTags(response.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        }
    };

    useEffect(() => {
        fetchUserQuestions();
        fetchUserAnswers();
        fetchUserTags();
    }, [username]);

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
    };

    const handleEditAnswer = (answer) => {
        setEditingAnswer(answer);
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            await axios.delete(`http://localhost:8000/api/questions/${questionId}`);
            setUserQuestions(userQuestions.filter(question => question._id !== questionId));
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        try {
            await axios.delete(`http://localhost:8000/api/answers/${answerId}`);
            setUserAnswers(userAnswers.filter(answer => answer._id !== answerId));
        } catch (error) {
            console.error('Error deleting answer:', error);
        }
    };

    const handleDeleteTag = async (tagId) => {
        try {
            await axios.delete(`http://localhost:8000/api/tags/${tagId}`, {
                data: { username } // Send username in the request body
            });
            setUserTags(userTags.filter(tag => tag._id !== tagId));
        } catch (error) {
            console.error('Error deleting tag:', error);
        }
    };
    

    const handleEditTag = (tag) => {
        setEditingTag(tag);
    };

    const handleTagUpdated = () => {
        setEditingTag(null);
        fetchUserTags();
    };
    

    const handleCancelEdit = () => {
        setEditingQuestion(null);
        setEditingAnswer(null);
    };

    const handleQuestionUpdated = () => {
        setEditingQuestion(null);
        fetchUserQuestions();
    };

    const handleAnswerUpdated = () => {
        setEditingAnswer(null);
        fetchUserAnswers();
    };

    return (
        <div className="profile-content">
            <h1>{username}'s Profile</h1>

            {/* Questions Section */}
            <h2>Your Questions:</h2>
            {editingQuestion ? (
                <EditQuestionForm
                    question={editingQuestion}
                    onCancel={handleCancelEdit}
                    onQuestionUpdated={handleQuestionUpdated}
                />
            ) : (
                <div>
                    {userQuestions.length > 0 ? (
                        userQuestions.map((question) => (
                            <div key={question._id} className="user-question" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ cursor: 'pointer', color: 'blue', flexGrow: 1, marginRight: '10px' }} onClick={() => handleEditQuestion(question)}>
                                    {question.title}
                                </h3>
                                <button onClick={() => handleDeleteQuestion(question._id)} style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '30px',
                                    height: '30px'
                                }}>
                                    &#10005; {/* Unicode X symbol */}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>You have not asked any questions yet.</p>
                    )}
                </div>
            )}

            {/* Answers Section */}
            <h2>Your Answers:</h2>
            <div>
            {editingAnswer ? (
                <EditAnswerForm
                    answer={editingAnswer}
                    onCancel={handleCancelEdit}
                    onAnswerUpdated={handleAnswerUpdated}
                />
            ) : (
                <div>
                    {userAnswers.length > 0 ? (
                        userAnswers.map(answer => (
                            <div key={answer._id} className="user-answer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ cursor: 'pointer', color: 'blue', flexGrow: 1, marginRight: '10px' }} onClick={() => handleEditAnswer(answer)}>
                                    {answer.text}
                                </h3>
                                <button onClick={() => handleDeleteAnswer(answer._id)} style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '30px',
                                    height: '30px'
                                }}>
                                    &#10005; {/* Unicode X symbol */}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>You have not answered any questions yet.</p>
                    )}
                </div>
            )}
            </div>

            {/* Tags Section */}
            <h2>Your Tags:</h2>
            {editingTag ? (
                <EditTags
                    tag={editingTag}
                    onTagUpdated={handleTagUpdated}
                />
            ) : (
                <div>
                    {userTags.length > 0 ? (
                        userTags.map(tag => (
                            <div key={tag._id} className="user-tag" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ cursor: 'pointer', color: 'blue', flexGrow: 1, marginRight: '10px' }} onClick={() => handleEditTag(tag)}>
                                    {tag.name}
                                </h3>
                                <button onClick={() => handleDeleteTag(tag._id)} style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '30px',
                                    height: '30px'
                                }}>
                                    &#10005; {/* Unicode X symbol */}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>You have not created any tags yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;
