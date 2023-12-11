import React, { useState } from 'react';
import axios from 'axios';
import {useAuth} from './AuthContext';

const AnswerForm = ({ question, onAnswerPosted }) => {
  const [answerText, setAnswerText] = useState('');
  const [answerUsername, setAnswerUsername] = useState('');
  const { username } = useAuth();

  const handleSubmit = async (e) => {
     e.preventDefault();

    const answerData = {
      text: answerText,
      ans_by: username
    };
    
    try {
      const postResponse = await axios.post('http://localhost:8000/api/answers', answerData);
      console.log("Answer posted to backend:", postResponse.data);

      setAnswerUsername("");
      setAnswerText("");
      const newAnswer = postResponse.data._id;

      const putResponse = await axios.put(`http://localhost:8000/api/questions/${question._id}`, { newAnswerId: newAnswer });
      console.log('Update successful:', putResponse.data);

      onAnswerPosted(putResponse.data);

  } catch (error) {
      console.error('Error updating resource:', error);
    }
    // Call the onAnswerPosted callback to inform the parent component that an answer has been posted
  };
  
  return (
    <form id="answerForm" onSubmit={handleSubmit}>
      {/* <div className="form-group">
        <label htmlFor="answerUsername">Username*</label>
        <input
          type="text"
          id="answerUsername"
          placeholder="Username"
          value={answerUsername}
          onChange={(e) => setAnswerUsername(e.target.value)}
          required
        />
      </div> */}
      <div className="form-group">
        <label htmlFor="answerText">Answer Text*</label>
        <textarea
          id="answerText"
          placeholder="Your Answer"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          required
        />
      </div>
      <div className="submit-container">
        <button className="submit-button" type="submit">Post Answer</button>
        <p className="mandatory-field-note">*indicates mandatory field</p>
      </div>
    </form>
  );
};

export default AnswerForm;
