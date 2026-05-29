import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import Lab from './components/Lab';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
