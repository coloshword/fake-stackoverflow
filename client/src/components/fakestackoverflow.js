import React, { useState } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import Content from './content';
import Model from '../models/model.js';
import HomeScreen from './homescreen';

const FakeStackOverflow = () => {
    const [selectedTab, setSelectedTab] = useState('questions');
    const [modelData, setModelData] = useState(new Model());
    const [searchText, setSearchText] = useState('');
    const [showAskQuestionForm, setShowAskQuestionForm] = useState(false);
    const [showQuestionsForTag, setShowQuestionsForTag] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState(''); 

    const handleLoggedIn = (username) => {
        hideHomeScreen(); // This method already exists in your component
        setLoggedInUser(username);
    };

    const hideHomeScreen = () => {
        setShowHomeScreen(false);
    };

    const handleTabChange = (newTab) => {
        setSelectedTab(newTab);
        setShowQuestionsForTag(false);
    };

    const handleTagClick = (tagId) => {
        setSelectedTag(tagId);
        setShowQuestionsForTag(true); // Assume we want to show questions for this tag
    };

    const handleSearchInputChange = (text) => {
        setSearchText(text);
    };

    const addQuestion = (title, text, tagIds, askedBy) => {
        const newQuestion = {
            qid: `q${modelData.data.questions.length + 1}`,
            title: title,
            text: text,
            tagIds: tagIds.split(' '),
            askedBy: askedBy,
            askDate: new Date(),
            ansIds: [],
            views: 0,
        };
        setModelData(prevData => ({
            ...prevData,
            data: {
                ...prevData.data,
                questions: [...prevData.data.questions, newQuestion]
            }
        }));
        onHideAskQuestionForm();
        setSelectedTab('questions'); // Redirect to questions page after adding a question
    };

    const onQuestionSelected = () => {
        setSelectedTab(''); // This will unselect the 'Questions' tab
    };

    const onHideAskQuestionForm = () => {
        setShowAskQuestionForm(false);
    };

    if (showHomeScreen) {
        return <HomeScreen onLoggedIn={handleLoggedIn} />;
    }

    return (
        <div>
            <Header onSearchInputChange={handleSearchInputChange} />
            <div id="main" className="main">
                <div className="container">
                    <Sidebar 
                        selectedTab={selectedTab}
                        showQuestionsForTag={showQuestionsForTag} 
                        setSelectedTab={setSelectedTab}
                        model={modelData}
                        setModelData={setModelData} 
                        handleTabChange={handleTabChange}
                    />
                    <span> Logged in as {loggedInUser}</span>
                    <Content 
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        selectedTag={selectedTag}
                        setSelectedTag={setSelectedTag} 
                        onAddQuestion={addQuestion}
                        showAskQuestionForm={showAskQuestionForm}
                        onHideAskQuestionForm={onHideAskQuestionForm}
                        onQuestionSelected={onQuestionSelected}
                        onTagClick={handleTagClick}
                        showQuestionsForTag={showQuestionsForTag} // Make sure this line is included
                        searchText={searchText}
                    />
                </div>
            </div>
        </div>
    );
}

export default FakeStackOverflow;
