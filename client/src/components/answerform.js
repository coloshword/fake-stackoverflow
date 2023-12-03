import React, { useState } from 'react';
import axios from 'axios';

const AnswerForm = ({ question, onAnswerPosted }) => {
  const [answerText, setAnswerText] = useState('');
  const [answerUsername, setAnswerUsername] = useState('');

  const handleSubmit = async (e) => {
     e.preventDefault();

    const answerData = {
      text: answerText,
      ans_by: answerUsername
    };
    
    try {
      const postResponse = await axios.post('http://localhost:8000/api/answers', answerData);
      console.log("Answer posted to backend:", postResponse.data);

      // Reset form fields after successful submission
      setAnswerUsername("");
      setAnswerText("");

      // Add the new answer ID to the question's answers array
      const updatedAnswers = [...question.answers, postResponse.data._id];
      console.log("Updated answers array:", updatedAnswers);

      // Update the question object with the new answers array
      const updatedQuestion = { ...question, answers: updatedAnswers };

      // Make a PUT request to update the question
      const putResponse = await axios.put(`http://localhost:8000/api/questions/${question._id}`, { answers: updatedAnswers });
      console.log('Update successful:', putResponse.data);

      // Call the onAnswerPosted callback
      onAnswerPosted(updatedQuestion);

  } catch (error) {
      console.error('Error updating resource:', error);
    }
    // Call the onAnswerPosted callback to inform the parent component that an answer has been posted
  };
  
  return (
    <form id="answerForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="answerUsername">Username*</label>
        <input
          type="text"
          id="answerUsername"
          placeholder="Username"
          value={answerUsername}
          onChange={(e) => setAnswerUsername(e.target.value)}
          required
        />
      </div>
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
