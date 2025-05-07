import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UsersRegisterPage from './pages/UsersRegisterPage';
import UsersLoginPage from './pages/UsersLoginPage';
import ChickEntryPage from './pages/ChickEntryPage';
import ChickDeathPage from './pages/ChickDeathPage';
import FarmSectionPage from './pages/FarmSectionPage';
import { AuthProvider } from './util/authContext';
import './App.css';

export default function App() {
  return (
  <AuthProvider>
    <Router>
      <div className="app-container">
        <header className="app-header">
          CHERRYBRO
        </header>
        <div className="app-body">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<UsersLoginPage />} />
              <Route path="/register" element={<UsersRegisterPage />} />
              <Route path="/chick-entry" element={<ChickEntryPage />} />
              <Route path="/chick-death" element={<ChickDeathPage />} />
              <Route path="/farm-section" element={<FarmSectionPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  </AuthProvider>
  );
}
