import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {useAuth} from './AuthContext';

//IMPORTANT: question, can be a question , or an answer (since both question and answer have comments)
const Comments = ({ isQuestion, question }) => {
    const [newComment, setNewComment] = useState("");
    const [fullComments, setFullComments] = useState([]);
    const [refreshComments, setRefreshComments] = useState(false); 
    const [currentQuestion, setCurrentQuestion] = useState(question);  // use it to retrieve new object from db
    const { username } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentIds = currentQuestion.comments;
                if (commentIds && commentIds.length > 0) {
                    const commentsResponses = await Promise.all(
                        commentIds.map(commentId =>
                            axios.get(`http://localhost:8000/api/comment/${commentId}`)
                        )
                    );
                    const newComments = commentsResponses.map(response => response.data);
                    newComments.reverse();
                    setFullComments(newComments);
                }
            } catch (error) {
                console.error('Error fetching comments: ', error);
            }
        };
    
        fetchComments();
    }, [question.comments, refreshComments]);
    
    const updateQuestion = async () => {
        try {
            let response;
            if(isQuestion){
                console.log("querying question");
                response = await axios.get(`http://localhost:8000/api/question/${question._id}`);
            }else {
                console.log("here is the question " + question);
                response = await axios.get(`http://localhost:8000/api/answer/${question._id}`);
            }
            setCurrentQuestion(response.data);
            setRefreshComments((prevRefreshComments) => !prevRefreshComments);
        }
        catch(err){
            console.error('Error fetching question: ', err);
        }
    };

    const newCommentChange = (e) => {
        setNewComment(e.target.value);
    }

    const newCommentEnter = async (e) => {
        if (e.key === "Enter" && newComment !== "") {
            const commentObj = { isQuestion: isQuestion,question: question._id, newComment }; 
            try {
                const response = await axios.post('http://localhost:8000/api/add_comment', commentObj);
                console.log(response.data);
                setNewComment("");
                updateQuestion();
            } catch (error) {
                console.error('Error posting comment: ', error);
            }
        }
    }

    /*
    * handleUpVote: handles upvoting a comment by adding the user's id to the comment's upvote array
    */
    const handleUpVote = async () => {
        if(username == null) {
            alert("You must be logged in to upvote a comment");
            return;
        }
        console.log("upvoting comment " + username);
    }

    return (
        <div className="question-comments">
            <div className="comments-inner">
                <div className="comment-display">
                    {fullComments.map((comment, index) => (
                        <div className="comment" key={index}>
                            <div className="count-voteBtn-container">
                                <button className="vote-btn" onClick={handleUpVote}></button>
                                <span> {comment.com_vote.length} </span>
                            </div>
                            <span className="comment-text">{comment.text}</span> 
                        </div>
                    ))}
                </div>
                <div className="new-commentField">
                    <input type="text"
                            className="new-comment"
                            placeholder="Add a comment"
                            onChange={newCommentChange}
                            value={newComment}
                            onKeyDown={newCommentEnter} />
                </div>
            </div>
        </div>
    );
    
    }

export default Comments;
