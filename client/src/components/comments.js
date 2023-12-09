import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {useAuth} from './AuthContext';
import { timeAgo } from "../helpers/timeago";

//IMPORTANT: question, can be a question , or an answer (since both question and answer have comments)
const Comments = ({ isQuestion, question }) => {
    const [newComment, setNewComment] = useState("");
    const [fullComments, setFullComments] = useState([]);
    const [refreshComments, setRefreshComments] = useState(false); 
    const [currentQuestion, setCurrentQuestion] = useState(question);  // use it to retrieve new object from db
    const { username } = useAuth();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/user/${username}`);
                setUserId(response.data);
            }
            catch(error) {
                console.log("error fetching userID", error);
            }
        }
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
        fetchUserId();
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
            const commentObj = { isQuestion: isQuestion,question: question._id, comment_by: username,newComment }; 
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
    const handleUpVote = async (comment) => {
        if(username == null) {
            alert("You must be logged in to upvote a comment");
            return;
        }
        try {
            const upvoteObj = { username };
            const response = await axios.patch(`http://localhost:8000/api/comment/${comment._id}`, upvoteObj);
            setRefreshComments((prevRefreshComments) => !prevRefreshComments);
        }
        catch(error) {
            console.error('Error upvoting comment: ', error);
        }
    }

    /*
    * renderComment: renders an individual comment, with styling (orange if updated, etc...)
    */
   const renderComment = (comment, index) => {
    var className = "vote-btn";
    // fetch user id
    if (comment.com_vote.includes(userId)) {
        className = "vote-btn-up";
    }
    return(                      
        <div className="comment" key={index}>
            <div className="count-voteBtn-container">
                <button className={className} onClick={() => handleUpVote(comment)}></button>
                <span> {comment.com_vote.length} </span>
            </div>
            <span className="comment-text">{comment.text}</span> 
            <div className="comment-data">
                <span className="comment-by">{comment.comment_by}</span>
                <span className="comment-time">{timeAgo(comment.com_date_time)}</span>
            </div>
        </div>
        )
   }

    return (
        <div className="question-comments">
            <div className="comments-inner">
                <div className="comment-display">
                    {fullComments.map((comment, index) => (
                        renderComment(comment, index)
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
