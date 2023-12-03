const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Question = require('./models/questions');
const Tag = require('./models/tags');
const Answer = require('./models/answers');


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

// Example route for fetching questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find({});
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
        const answers = await Answer.find({});
        res.json(answers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching questions');
    }
});

app.post('/api/answers', async (req, res) => {
    try {
        // Extracting data from request body
        const { text, ans_by } = req.body;
        const ans_date_time = new Date(); // Set the current date and time for the answer

        // Creating a new answer document
        const newAnswer = new Answer({
            text,
            ans_by,
            ans_date_time
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

app.post('/api/questions', async (req, res) =>{
    try{
        const { title, details, tags, askedBy } = req.body; // Include 'tags' in destructuring

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
            tags: newTagIds, // Use 'newTagIds' instead of 'newTagIds'
            asked_by: askedBy,
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

// Add more routes for other operations and models...

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});