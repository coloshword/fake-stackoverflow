import React, { useState, useEffect} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { Message } from './message';

// every voting interface has an associated question or Ans, and userId (to change reputation)
const VoteInterface = ({questOrAns, isQuestion}) => {
    const [refreshVotes, setRefreshVotes] = useState(false);
    const {username} = useAuth();
    const [currentQuestAns, setCurrentQuestAns] = useState(questOrAns);
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(0); 
    const [showMessage, setShowMessage] = useState(false);
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
        // fetch newest version of questOrAns 
        const fetchCurrentQuestAns = async () => {
            try {
                var response;
                if(isQuestion) {
                    response = await axios.get(`http://localhost:8000/api/question/${questOrAns._id}`);
                    setCurrentQuestAns(response.data);
                }
            } catch(err) {
                console.log("error updating the question in useEffect");
            }
        }
        fetchUserId();
        fetchCurrentQuestAns();
    }, [questOrAns._id, isQuestion]);

    const renderUpvote = () => {
        let btnClass = "vote-interface-upvote";
        // render upvote, meaning we'll choose "upvoted" class styling if the username_id exists in the question / ans voting array
        if(currentQuestAns.upvoters.includes(userId)) {
            btnClass = "vote-interface-upvoted";
        }
        if (username) {
            return (
                <button className={btnClass} onClick={() => handleVote(true)}>
                </button>
            );
        } else {
            return null;
        }
    }

    const renderDownVote = () => {
        let btnClass = "vote-interface-downvote";
        if(currentQuestAns.downvoters.includes(userId)) {
            btnClass = "vote-interface-downvoted";
        }
        if (username) {
            return (
                <button className={btnClass} onClick={() => handleVote(false)}>
                </button>
            );
        } else {
            return null;
        }
    }

    const handleVote = async (isUpvote) => {
        if(username == null) {
            alert("You must be logged in to vote");
        }
        // add the userId of the current user to the database
        const requestBody = {
            isQuestion: isQuestion,
            isUpvote: isUpvote,
            voterUsername: username,
        }
        try {
            const response = await axios.patch(`http://localhost:8000/api/voting/${questOrAns._id}`, requestBody);
            
            if (!response.data) {
                throw new Error('Server responded without data.');
            }
            if (response.status === 403) {
                setMessage(response.data.message || "You don't have enough reputation to vote");
                setMessageType(1);
                setShowMessage(true);
                return;
            }
    
            setCurrentQuestAns(response.data);
            setRefreshVotes(!refreshVotes);
        } catch (err) {
            // Handle other errors
            setMessage(err.response?.data?.message || err.message);
            setMessageType(1);
            setShowMessage(true);
            console.log("Error in voting:", err);
        }
    };
    return(
        <div className="vote-interface-container">
            {showMessage && <Message message={message} messageType={messageType} onHide={() => setShowMessage(false)} />}
            {renderUpvote()}
            <span className="vote-interface-num"> {currentQuestAns.upvoters.length - currentQuestAns.downvoters.length} </span>
            {renderDownVote()}
        </div>
    )
};

export{VoteInterface}