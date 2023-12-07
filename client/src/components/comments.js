import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const Comments = ({ question }) => {
    const [newComment, setNewComment] = useState("");
    const [fullComments, setFullComments] = useState([]);
    const [refreshComments, setRefreshComments] = useState(false); 
    const [currentQuestion, setCurrentQuestion] = useState(question);  // use it to retrieve new object from db

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentIds = question.comments;
                if (commentIds && commentIds.length > 0) {
                    console.log(commentIds);
                    const commentsResponses = await Promise.all(
                        commentIds.map(commentId =>
                            axios.get(`http://localhost:8000/api/comment/${commentId}`)
                        )
                    );
                    const newComments = commentsResponses.map(response => response.data);
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
            const response = await axios.get(`http://localhost:8000/api/question/${question._id}`);
            setCurrentQuestion(response.data);
            setRefreshComments((prevRefreshComments) => !prevRefreshComments);
        }
        catch(err){
            console.error('Error fetching question: ', err);
        }
    };

    const newCommentChange = (e) => {
        console.log(question); //question.id
        setNewComment(e.target.value);
    }

    const newCommentEnter = async (e) => {
        if (e.key === "Enter" && newComment !== "") {
            const commentObj = { question: question._id, newComment }; 
            try {
                const response = await axios.post('http://localhost:8000/api/comment', commentObj);
                console.log(response.data);
                setNewComment("");
                updateQuestion();
            } catch (error) {
                console.error('Error posting comment: ', error);
            }
        }
    }

    return (
        <div className="question-comments">
            <div className="comment-display">
                {fullComments.map((comment, index) => (
                    <span key={index}>{comment.text}</span> 
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
     );
    
    }

export default Comments;
