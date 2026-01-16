import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ARGuide from './components/ARGuide';
import Recommendations from './components/Recommendations';
import Chatbot from './components/Chatbot';
import Favorites from './components/Favorites';
import { DarkModeProvider } from './context/DarkModeContext';

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ar" element={<ARGuide />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/chat" element={<Chatbot />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;

