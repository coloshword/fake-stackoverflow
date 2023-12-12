const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password validation

const Question = require('./models/questions');
const Tag = require('./models/tags');
const Answer = require('./models/answers');
const User = require('./models/users');
const Comment = require('./models/comments');
const Admin = require('./models/admin');


const app = express();
const PORT = 8000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/fake_so';

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

async function fetchUserById(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return null; 
        }
        return user;
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err; 
    }
}

async function fetchUserByUsername(username) {
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log('User not found');
            return null; 
        }
        return user;
    } catch (err) {
        console.error('Error fetching user by username:', err);
        throw err; 
    }
}

/* get userID given username */
app.get('/api/user/:username', async (req, res) => {
    try {
        const username = req.params.username; 
        const user = await fetchUserByUsername(username);

        if (user) {
            res.json(user.id); 
        } else {
            res.status(404).send('User not found'); 
        }
    } catch (err) {
        console.error('Error in /api/user/:username route:', err);
        res.status(500).send('could not get userid from username');
    }
});

// Endpoint to get questions by a specific user
app.get('/api/questions/user/:username', async (req, res) => {
    try {
        // Fetch the user's ID based on the username
        // This requires that you have a unique username for each user and a User model
        const username = req.params.username;
        const user = await fetchUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all questions by the user's ID
        const questions = await Question.find({ ques_by: user._id });

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions by user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get questions by a specific user
app.get('/api/answers/user/:username', async (req, res) => {
    try {
        // Fetch the user's ID based on the username
        // This requires that you have a unique username for each user and a User model
        const username = req.params.username;
        const user = await fetchUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all questions by the user's ID
        const answers = await Answer.find({ ans_by: user._id });

        res.json(answers);
    } catch (error) {
        console.error('Error fetching questions by user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get questions by a specific user
app.get('/api/tags/user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming 'tags' is an array of tag IDs in the User model
        const userTags = user.tags;
        if (!userTags || userTags.length === 0) {
            return res.status(200).json([]); // No tags found for the user
        }

        // Fetch the tag documents for each tag ID in the user's tags array
        const tags = await Tag.find({ '_id': { $in: userTags }});

        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags by user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.patch('/api/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            req.body,
            { new: true } // Return the updated document instead of the original
        );

        if (!updatedQuestion) {
            return res.status(404).send('Question not found');
        }

        res.status(200).json(updatedQuestion);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Example route for fetching questions
app.get('/api/questions', async (req, res) => {
    try {
        let questions = await Question.find({});

        // Convert Mongoose documents to plain objects to safely modify them
        questions = questions.map(doc => doc.toObject());

        for (let i = 0; i < questions.length; i++) {
            const user = await fetchUserById(questions[i].ques_by);
            if (user) {
                // Replace 'ques_by' with the username of the user
                questions[i].ques_by = user.username;
            } else {
                // Handle the case where the user is not found
                questions[i].ques_by = 'Unknown';
            }
        }
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching questions');
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const tags = await Tag.find({});
        res.json(tags);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching questions');
    }
});

app.get('/api/answers', async (req, res) => {
    try {
        let answers = await Answer.find({}).populate('ans_by', 'username'); // Using populate to get username

        // Convert Mongoose documents to plain objects to safely modify them
        answers = answers.map(doc => doc.toObject());

        for (let i = 0; i < answers.length; i++) {
            // Check if 'ans_by' field is populated with user data
            if (answers[i].ans_by && answers[i].ans_by.username) {
                // Replace 'ans_by' with the username of the user
                answers[i].ans_by = answers[i].ans_by.username;
            } else {
                // Handle the case where the user is not found or not populated
                answers[i].ans_by = 'Unknown';
            }
        }
        res.json(answers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching answers');
    }
});


app.post('/api/answers', async (req, res) => {
    try {
        // Extracting data from request body
        const { text, ans_by } = req.body;
        const ans_date_time = new Date(); // Set the current date and time for the answer
        const user = await fetchUserByUsername(ans_by);

        // Creating a new answer document
        const newAnswer = new Answer({
            text: text,
            ans_by: user._id,
            ans_date_time: new Date()
        });

        // Saving the answer to the database
        user.answers.push(newAnswer._id);
        await user.save();
        await newAnswer.save();

        // Sending success response
        res.status(201).json(newAnswer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving answer');
    }
});

/* get answer given answer id */
app.get('/api/answer/:answerId', async (req, res) => {
    try {
        const answerId = req.params.answerId;
        const answer = await Answer.findById(answerId);
        if (answer) {
            res.status(200).json(answer);
        } else {
            res.status(404).send('Answer with id not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching the answer');
    }
});

app.post('/api/questions', async (req, res) =>{
    try{
        const { title, details, tags, askedBy } = req.body; // Include 'tags' in destructuring
        const user = await fetchUserByUsername(askedBy);

        // Validate that tags is an array, if necessary
        if (!Array.isArray(tags)) {
            return res.status(400).send('Tags must be an array');
        }

        // Find or create tags
        const newTagIds = [];
        for (const tagName of tags) {
            let tag = await Tag.findOne({ name: new RegExp(`^${tagName}$`, 'i') });
            if (!tag) {
                tag = new Tag({ name: tagName });
                user.tags.push(tag._id);
                await tag.save();
            }
            newTagIds.push(tag._id);
        }

        console.log(newTagIds);

        const newQuestion = new Question({
            title: title,
            text: details,
            tags: newTagIds, 
            ques_by: user._id,
            ask_date_time: new Date(),
            answers: [],
            views: 0
        });

        user.questions.push(newQuestion._id);
        await user.save();

        await newQuestion.save();
        res.status(201).json(newQuestion);


    } catch(err){
        console.error(err);
        res.status(500).send('Error submitting the question');
    }
});

app.put('/api/questions/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        const { newAnswerId } = req.body; 

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).send('Question not found');
        }

        if (newAnswerId && !question.answers.includes(newAnswerId)) {
            question.answers.push(newAnswerId);
        }
        await question.save();

        res.status(200).json(question);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the question');
    }
});

app.patch('/api/questions/edit/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        // Find the question and update it
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                $set: req.body // Set the fields in req.body
            },
            { new: true } // Return the modified document rather than the original
        );

        if (!updatedQuestion) {
            return res.status(404).send('Question not found');
        }

        res.status(200).json(updatedQuestion);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the question');
    }
});

app.patch('/api/answers/edit/:answerId', async (req, res) => {
    try {
        const { answerId } = req.params;
        // Find the question and update it
        const updatedAnswer = await Answer.findByIdAndUpdate(
            answerId,
            {
                $set: req.body // Set the fields in req.body
            },
            { new: true } // Return the modified document rather than the original
        );

        if (!updatedAnswer) {
            return res.status(404).send('Question not found');
        }

        res.status(200).json(updatedAnswer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the question');
    }
});

app.patch('/api/tags/edit/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { username } = req.body;
        const user = await fetchUserByUsername(username);

         // Fetch the user ID based on the username
         if (!user) {
             return res.status(404).send('User not found');
         }
        const userId = user._id; // Assuming the user's ID is available in the request

        // Check if the tag is used in questions not authored by the current user
        const isTagUsedElsewhere = await Question.exists({
            tags: tagId,
            ques_by: { $ne: userId }
        });

        if (isTagUsedElsewhere) {
            return res.status(403).send('Tag is used in other questions and cannot be edited');
        }

        // Update the tag if it's only used in questions by the current user
        const updatedTag = await Tag.findByIdAndUpdate(
            tagId,
            {
                $set: req.body // Set the fields in req.body
            },
            { new: true } // Return the modified document rather than the original
        );

        if (!updatedTag) {
            return res.status(404).send('Tag not found');
        }

        res.status(200).json(updatedTag);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the tag');
    }
});

app.delete('/api/tags/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { username } = req.body; // Assuming username is sent in the request body
        const user = await fetchUserByUsername(username);

        // Fetch the user ID based on the username
        if (!user) {
            return res.status(404).send('User not found');
        }
        const userId = user._id;

        // Check if the tag is used in questions not authored by the current user
        const isTagUsedElsewhere = await Question.exists({
            tags: tagId,
            ques_by: { $ne: userId } // Checking for questions with a different author
        });

        if (isTagUsedElsewhere) {
            return res.status(403).send('Tag is used in questions by other authors and cannot be deleted');
        }

        // Delete the tag if it's only used in questions by the current user
        const deletedTag = await Tag.findByIdAndDelete(tagId);

        if (!deletedTag) {
            return res.status(404).send('Tag not found');
        }

        res.status(200).send('Tag successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting the tag');
    }
});




/* get question given question id */
app.get('/api/question/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);
        if (question) {
            res.status(200).json(question);
        } else {
            res.status(404).send('Question with id not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching the question');
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        // Fetch the single admin document
        const admin = await Admin.findOne().populate('users');
        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        res.json({ users: admin.users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/admin/details', async (req, res) => {
    try {
        const admin = await Admin.findOne(); // Find the admin document

        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        // Send the user_date_time of the admin
        res.json({ user_date_time: admin.user_date_time });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Delete related questions, answers, comments, and tags
        await Question.deleteMany({ ques_by: userId });
        await Answer.deleteMany({ ans_by: userId });
        await Comment.deleteMany({ comment_by: userId });
        // If tags are solely owned by a user, delete them as well
        // await Tag.deleteMany({ createdBy: userId });

        // Remove the user from the users array of any Admin document that references them
        await Admin.updateMany(
            { users: userId },
            { $pull: { users: userId } }
        );

        // Finally, delete the user
        await User.deleteOne({ _id: userId });

        res.status(200).send('User and all related data successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;

    try {
        // Find the question to get the user who asked it
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const userId = question._id; // Assuming 'askedBy' holds the ID of the user who asked the question
        
        // Remove the question ID from the user's questions array
        await User.findByIdAndUpdate(userId, { $pull: { questions: questionId } });

        // Delete the question
        await Question.findByIdAndDelete(questionId);

        res.status(200).json({ message: 'Question successfully deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting the question' });
    }
});

app.delete('/api/answers/:answerId', async (req, res) => {
    const { answerId } = req.params;

    try {
        // Find the question to get the user who asked it
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const userId = answer.ans_by; // Assuming 'ans_by' holds the ID of the user who answered

        // Find the question that contains this answer and remove the answer ID from its answers array
        const question = await Question.findOneAndUpdate(
            { answers: answerId },
            { $pull: { answers: answerId } },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Remove the question ID from the user's answers array
        await User.findByIdAndUpdate(userId, { $pull: { answers: answerId } });

        // Delete the answer
        await Answer.findByIdAndDelete(answerId);
        

        res.status(200).json({ message: 'Answer successfully deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting the question' });
    }
});




app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username: username });
        if (!admin) {
            return res.status(401).send('Admin not found');
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).send('Invalid credentials');
        }

        // Fetching the users associated with the admin
        const users = await User.find({ '_id': { $in: admin.users } });

        res.json({ message: 'Admin logged in successfully', users: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid credentials');
        }

        // Create a new object without the password field
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ user: userObj });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/users/register', async (req, res) => {
    try {
        // Check if username already exists
        const existingUserByUsername = await User.findOne({ username: req.body.username });
        if (existingUserByUsername) {
            console.log("existing username");
            return res.status(400).send('Username already exists');
        }

        // Check if email already exists
        const existingUserByEmail = await User.findOne({ email: req.body.email });
        if (existingUserByEmail) {
            return res.status(400).send('Email already in use');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const ans_date_time = new Date();

        // Create new user
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            reputation: 90, // Assuming a default reputation value
            questions: [],
            tags: [],
            answers: [],
            user_date_time: ans_date_time
        });

        // Save new user
        await newUser.save();

        const admin = await Admin.findOne(); // Assuming there's only one admin
        if (admin) {
            admin.users.push(newUser._id);
            await admin.save();
        }

        // Response after successful account creation
        res.status(201).json({ message: 'Account created successfully', username: newUser.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/add_comment', async (req, res) => {
    try {
        const { isQuestion, question, comment_by, newComment } = req.body;
        const comment = new Comment({
            text: newComment,
            comment_by: comment_by, 
            com_date_time: new Date(),
            com_vote: [] // empty array because no upvotes yet
        });
        await comment.save();

        let questionOrAnswerObj;
        if(isQuestion) {
            // Find the question by its ID
            questionOrAnswerObj = await Question.findOne({ _id: question });
        } else {
            // find answer by its ID
            questionOrAnswerObj = await Answer.findOne({ _id: question })
        }

        if (questionOrAnswerObj) {
            questionOrAnswerObj.comments.push(comment._id);
            await questionOrAnswerObj.save();
            res.status(201).json({ message: comment });
        } else {
            res.status(404).send('Question not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting the comment');
    }
});

/* get comment given comment id */
app.get('/api/comment/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);

        if (comment) {
            res.status(200).json(comment);
        } else {
            res.status(404).send('Comment not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching the comment');
    }
});

/* Add to comment upvote array */
app.patch('/api/comment/:commentId', async (req, res) => {
    try {
        const { username } = req.body;
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        const user = await fetchUserByUsername(username);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        if (!user) {
            return res.status(404).send('User not found');
        }
        const userId = user._id;
        const index = comment.com_vote.indexOf(userId);
        if (index > -1) {
            // already upvoted, remove their upvote
            comment.com_vote.splice(index, 1);
            await comment.save();
            return res.status(200).json("Upvote removed");
        } else {
            // not upvoted, add 
            comment.com_vote.push(userId);
            await comment.save();
            return res.status(200).json("Upvote added");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating the comment');
    }
});


/* Add to voting interface */
app.patch('/api/voting/:questOrAnsId', async (req, res) => {
    try {
        const { isQuestion, isUpvote, voterUsername } = req.body;
        const passedId = req.params.questOrAnsId;
        let questOrAns;
        if (isQuestion) {
            questOrAns = await Question.findById(passedId);
        } else {
            questOrAns = await Answer.findById(passedId);
        }
        if (!questOrAns) {
            return res.status(404).json({ message: "Question or Answer not found" });
        }
        const voterUser = await fetchUserByUsername(voterUsername);
        if (!voterUser) {
            return res.status(404).json({ message: "Voter user not found" });
        }
        // first check user if they have enough reputation
        if (voterUser.reputation < 50) {
            return res.status(403).json({ message: 'You need at least 50 reputation to vote!' });
        }
        const voterId = voterUser._id;
        if (isUpvote) {
            const index = questOrAns.upvoters.indexOf(voterId);
            if (index > -1) {
                questOrAns.upvoters.splice(index, 1); // User already upvoted, so remove their vote
            } else {
                questOrAns.upvoters.push(voterId); // Add upvote
                // Remove from downvote array if it exists
                const downvoteIndex = questOrAns.downvoters.indexOf(voterId);
                if (downvoteIndex > -1) {
                    questOrAns.downvoters.splice(downvoteIndex, 1);
                }
            }
        } else {
            const index = questOrAns.downvoters.indexOf(voterId);
            if (index > -1) {
                questOrAns.downvoters.splice(index, 1); // User already downvoted, so remove their vote
            } else {
                questOrAns.downvoters.push(voterId); // Add downvote
                // Remove from upvote array if it exists
                const upvoteIndex = questOrAns.upvoters.indexOf(voterId);
                if (upvoteIndex > -1) {
                    questOrAns.upvoters.splice(upvoteIndex, 1);
                }
            }
        }
        await questOrAns.save();
        return res.status(200).json(questOrAns);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating the question or answer');
    }
});

app.patch('/api/users/:userId/reputation', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { reputationChange } = req.body;
        console.log(reputationChange);

        const user = await fetchUserByUsername(userId)
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.reputation += reputationChange;
        await user.save();
        res.status(200).json({ message: 'Reputation updated successfully', newReputation: user.reputation });
    } catch (err) {
        console.error(err);
        res.status(500).send('Reputation not changed');
    }
});







// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});