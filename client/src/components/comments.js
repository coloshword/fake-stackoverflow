import React, { useState, useEffect } from "react";


const Comments = () => {
    const [newComment, setNewComment] = useState("");

    const newCommentChange = (e) => {
        setNewComment(e.target.value);
    }

    const newCommentEnter = (e) => {
        if(e.key == "Enter" && newComment != "") {
            const commentObj = {newComment};
        }
    }
    return (
        <div className="question-comments">
            <div className="comment-display"></div>
            <div class="new-commentField">
                <input type="text" 
                className="new-comment" 
                placeholder="Add a comment" 
                onChange={newCommentChange} 
                onKeyDown={newCommentEnter}/>
            </div>
        </div>
    )
}

export default Comments;