import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {useAuth} from './AuthContext';
import { timeAgo } from "../helpers/timeago";

const CommentInputField = ({ isQuestion, question, updateQuestion }) => {
    const [newComment, setNewComment] = useState("");
    const { username } = useAuth();

    const newCommentChange = (e) => {
        setNewComment(e.target.value);
    }

    const newCommentEnter = async (e) => {
        if (e.key === "Enter" && newComment !== "") {
            const commentObj = { isQuestion: isQuestion, question: question._id, comment_by: username, newComment };
            try {
                await axios.post('http://localhost:8000/api/add_comment', commentObj);
                setNewComment("");
                updateQuestion();
            } catch (error) {
                console.error('Error posting comment: ', error);
            }
        }
    }

    return (
        <div className="new-commentField">
            <input type="text"
                   className="new-comment"
                   placeholder="Add a comment"
                   onChange={newCommentChange}
                   value={newComment}
                   onKeyDown={newCommentEnter} />
        </div>
    );
};

//IMPORTANT: question, can be a question , or an answer (since both question and answer have comments)
const Comments = ({ isQuestion, question }) => {
    const [fullComments, setFullComments] = useState([]);
    const [refreshComments, setRefreshComments] = useState(false); 
    const [currentQuestion, setCurrentQuestion] = useState(question);  // use it to retrieve new object from db
    const { username } = useAuth();
    const [userId, setUserId] = useState(null);
    const [commentsPage, setCommentsPage] = useState(0);

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

    const handleLeft = () => {
        let pageMin = 0;
        if (commentsPage > pageMin) {
            setCommentsPage(commentsPage - 1);
        }
    };
    
    const handleRight = () => {
        let pageMax = Math.floor((fullComments.length - 1) / 3);
        if (commentsPage < pageMax) {
            setCommentsPage(commentsPage + 1);
        }
    };
    
    const switchCommentPageBtn = () => {
        let pageMin = 0;
        let pageMax = Math.floor((fullComments.length - 1) / 3);
        if(pageMax < 0) {
            pageMax = 0;
        }
        console.log("PAGE MAX " + pageMax)
        return (
            <div className="comment-switch-container">
                <button 
                    className={`comment-switch-left ${commentsPage === pageMin ? 'disabled-button' : ''}`}
                    onClick={handleLeft}
                    disabled={commentsPage === pageMin}>
                </button>
                <span className="comment-page">{commentsPage}</span>
                <button 
                    className={`comment-switch-right ${commentsPage === pageMax ? 'disabled-button' : ''}`}
                    onClick={handleRight}
                    disabled={commentsPage === pageMax}>
                </button>
            </div>
        );
    };
    
    const updateQuestion = async () => {
        try {
            let response;
            if(isQuestion){
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
            return; // means that you already upvoted!
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

   /*
   * render3Comments: renders the 3 most recent comments 
   */
   const render3Comments = (page) => {
    const commentsPerPage = 3;
    const startIndex = page * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const commentsToRender = fullComments.slice(startIndex, endIndex);
    return (
        <div className="comment-display">
            {commentsToRender.map((comment, index) => (
                renderComment(comment, index)
            ))}
        </div>
    );
};


    return (
        <div className="question-comments">
            {switchCommentPageBtn()}
            <div className="comments-inner">
                {render3Comments(commentsPage)}
                <CommentInputField 
                    isQuestion={isQuestion} 
                    question={question} 
                    updateQuestion={updateQuestion} 
                />
            </div>
        </div>
    );
    
    }

export default Comments;
