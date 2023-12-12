import React, { useEffect } from 'react';
import DisplayAllQuestions from './questions';
import DisplayAllTags from './tags';
import AskQuestionForm from './AskQuestionForm';
import Profile from './Profile';


const Content = ({
    selectedTab,
    showQuestionsForTag,
    selectedTag,
    showAskQuestionForm,
    onHideAskQuestionForm,
    onAddQuestion,
    onTagClick,
    searchText
}) => {
    
    useEffect(() => {
        console.log("Selected Tag: ", selectedTag);
    }, [selectedTag]);


    const renderContent = () => {
        console.log(showQuestionsForTag);
        if (showQuestionsForTag && selectedTab === 'tags') {
            return (
                <DisplayAllQuestions
                    selectedTag={selectedTag}
                />
            );
        } else {
            switch (selectedTab) {
                case 'questions':
                    return (
                        <DisplayAllQuestions
                            searchText={searchText || ''}
                        />
                    );
                case 'tags':
                    return (
                        <DisplayAllTags
                            onTagClick={onTagClick}
                        />
                    );
                case 'profile':
                    return (
                        <Profile />
                    );
                default:
                    return null;
            }
        }
    };

    return (
        <div className="content">
            {showAskQuestionForm ? (
                <AskQuestionForm
                    onSubmit={onAddQuestion}
                    onClose={onHideAskQuestionForm}
                />
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default Content;
