import React from 'react';
import ReactDOM from 'react-dom';
import './stylesheets/index.css';
import './stylesheets/HomeScreen.module.css';
import './stylesheets/CreateAccount.module.css';
import FakeStackOverflow from './components/fakestackoverflow.js';
import { AuthProvider } from './components/AuthContext';



ReactDOM.render(
  <AuthProvider>
    <FakeStackOverflow />
  </AuthProvider>,
  document.getElementById('root')
);
