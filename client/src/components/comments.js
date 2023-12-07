import React, { useState, useEffect } from "react";
import axios from "axios";


const Comments = ({question}) => {
    const [newComment, setNewComment] = useState("");

    const newCommentChange = (e) => {
        setNewComment(e.target.value);
    }

    const newCommentEnter = async(e) => {
        console.log(question);
        if(e.key == "Enter" && newComment != "") {
            const commentObj = {question, newComment}; // what question the comment belongs to
            try {
                const response = await axios.post('http://localhost:8000/api/comment', commentObj);
                console.log(response.data);
                setNewComment("");
            } catch(error) {
                console.error('Error posting comment: ', error);
            }
        }
    }
    return (
        <div className="question-comments">
            <div className="comment-display">
            </div>
            <div className="new-commentField">
                <input type="text" 
                className="new-comment" 
                placeholder="Add a comment" 
                onChange={newCommentChange} 
                value={newComment}
                onKeyDown={newCommentEnter}/>
            </div>
        </div>
    )
}

export default Comments;