// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let mongoose = require('mongoose');
let userArgs = process.argv.slice(2);
let adminUsername = userArgs[1];
let adminPassword = userArgs[2];

const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt


if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')
let Comment = require('./models/comments')
let Admin = require('./models/admin')



let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
let comments = [];
let users = [];

function createAdminProfile(username, password, email, associatedUsers = []) {
  return bcrypt.hash(password, saltRounds).then(hash => {
      let adminDetails = {
          username: username,
          password: hash,
          email: email,
          users: associatedUsers // This can be a single user or an array of users
      };

      let admin = new Admin(adminDetails);
      return admin.save();
  });
}

function userCreate(username, password, email, reputation, questions, tags, answers, user_date_time) {
    // Basic user details
    let userDetails = { username: username, email: email };

    // Password hashing and additional details are handled in the promise
    return bcrypt.hash(password, saltRounds).then(hash => {
        // Add the hashed password to user details
        userDetails.password = hash;

        // Add optional fields if they are provided and valid
        if (reputation !== undefined) userDetails.reputation = reputation;
        if (Array.isArray(questions)) userDetails.questions = questions;
        if (Array.isArray(tags)) userDetails.tags = tags;
        if (Array.isArray(answers)) userDetails.answers = answers;

        // Check and add user_date_time if it's a valid date
        if (user_date_time && !isNaN(Date.parse(user_date_time))) {
            userDetails.user_date_time = user_date_time;
        }

        // Create a new user with the specified details and save to the database
        let user = new User(userDetails);
        return user.save();
    });
  }

function commentCreate(text, comment_by, com_date_time, com_vote) {
    let commentDetail = { text: text, comment_by: comment_by };
    if (com_date_time != false) commentDetail.com_date_time = com_date_time;
    if (com_vote != undefined) commentDetail.com_vote = com_vote;
  
    let comment = new Comment(commentDetail);
    return comment.save();
}

function tagCreate(name) {
  let tag = new Tag({ name: name });
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time, ans_vote, comments) {
    let answerDetail = { text: text, ans_by: ans_by };
    if (ans_date_time != false) answerDetail.ans_date_time = ans_date_time;
    if (ans_vote != undefined) answerDetail.ans_vote = ans_vote;
    if (comments != undefined) answerDetail.comments = comments;
  
    let answer = new Answer(answerDetail);
    return answer.save();
}

function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views) {
  qstndetail = {
    title: title,
    text: text,
    tags: tags,
    ques_by: asked_by
  }
  console.log(qstndetail);
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;

  let qstn = new Question(qstndetail);
  return qstn.save();
}


const populate = async () => {
  // Create tags first
  let t1 = await tagCreate('react');
  let t2 = await tagCreate('javascript');
  let t3 = await tagCreate('android-studio');
  let t4 = await tagCreate('shared-preferences');

  // Create comments
  let c1 = await commentCreate('COMMENT 1', 'user123', false, 2);
  let c2 = await commentCreate('COMMENT 2.', 'user124', false, 8);
  let c3 = await commentCreate('COMMENT 3', 'user123', false, 3);

  // Create an initial user without references
  let u1 = await userCreate('sampleUser', 'samplePassword', 'sampleuser@example.com', 100, [], [], [], false);

  // Now create answers and questions with the user reference
  let a1 = await answerCreate('React Router is mostly a wrapper...', u1, false, 5, []);
  // ... other answers ...

  let q1 = await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index...', [t1, t2], [a1], u1, false, false);
  // ... other questions ...

  // Update the user with the references to the created questions, tags, and answers
  u1.questions.push(q1);  // Repeat for other questions
  u1.tags.push(t1, t2, t3, t4);  // Add all tag IDs
  u1.answers.push(a1);  // Repeat for other answers
  await u1.save();

  // Create admin user
  let admin_user = await createAdminProfile(adminUsername, adminPassword, 'admin@example.com', [u1]);

  // Close database connection
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
