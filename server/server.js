const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password validation

const Question = require('./models/questions');
const Tag = require('./models/tags');
const Answer = require('./models/answers');
const User = require('./models/users');
const Comment = require('./models/comments');


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
            return null; // Or handle this case as needed
        }
        return user;
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err; // Rethrow the error if you want to handle it in the calling function
    }
}
async function fetchUserByUsername(username) {
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log('User not found');
            return null; // Or handle this case as needed
        }
        return user;
    } catch (err) {
        console.error('Error fetching user by username:', err);
        throw err; // Rethrow the error if you want to handle it in the calling function
    }
}


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
        console.log(questions);
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
        console.log(user);

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
                await tag.save();
            }
            newTagIds.push(tag._id);
        }

        const newQuestion = new Question({
            title: title,
            text: details,
            tags: newTagIds, 
            ques_by: user._id,
            ask_date_time: new Date(),
            answers: [],
            views: 0
        });

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
        const { answers } = req.body;

        // Find the question by ID
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).send('Question not found');
        }

        // Update the question fields
        if (answers) question.answers = answers;

        // Save the updated question
        await question.save();

        res.status(200).json(question);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the question');
    }
});

app.patch('/api/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).send('Question not found');
        }

        question.views += 1; // Increment the view count
        await question.save();

        res.status(200).json(question);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating the question');
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


app.post('/api/users/login', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.body.username });
        console.log(user);
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
            // Set default or initial values for other fields
            reputation: 90, // Assuming a default reputation value
            questions: [],
            tags: [],
            answers: [],
            user_date_time: ans_date_time
            // Add any other fields as necessary
        });

        // Save new user
        await newUser.save();

        // Response after successful account creation
        res.status(201).json({ message: 'Account created successfully', username: newUser.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/add_comment', async (req, res) => {
    try {
        console.log(req.body);
        const { isQuestion, question, newComment } = req.body;
        const comment = new Comment({
            text: newComment,
            comment_by: "username", 
            com_date_time: new Date(),
            com_vote: 0
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




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});