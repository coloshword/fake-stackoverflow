import React, { useState, useEffect} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// every voting interface has an associated question or Ans, and userId (to change reputation)
const VoteInterface = ({questOrAns, isQuestion}) => {
    const [refreshVotes, setRefreshVotes] = useState(false);
    const {username} = useAuth();
    const [currentQuestAns, setCurrentQuestAns] = useState(questOrAns);
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
            setCurrentQuestAns(response.data);
            setRefreshVotes(!refreshVotes);
        }
        catch(err) {
            console.log("Could not handleUpvote");
        }
    };
    return(
        <div className="vote-interface-container">
            {renderUpvote()}
            <span className="vote-interface-num"> {currentQuestAns.upvoters.length - currentQuestAns.downvoters.length} </span>
            {renderDownVote()}
        </div>
    )
};

export{VoteInterface}