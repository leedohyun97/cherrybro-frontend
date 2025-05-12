import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import UsersLoginPage from './pages/UsersLoginPage';
import UsersRegisterPage from './pages/UsersRegisterPage';
import ChickEntryPage from './pages/ChickEntryPage';
import ChickDeathPage from './pages/ChickDeathPage';
import ChickDisposalPage from './pages/ChickDisposalPage';
import FarmSectionPage from './pages/FarmSectionPage';
import AdminFarmSectionPage from './pages/AdminFarmSectionPage';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import { AuthProvider } from './util/authContext';

import './App.css';

export default function App() {
  return (
  <AuthProvider>
    <Router>
      <Routes>
        {/* ---------- PublicLayout : 헤더/사이드바 없음 ---------- */}
        <Route element={<PublicLayout />}>
          <Route index path="/login" element={<UsersLoginPage />} />
          <Route path="/register" element={<UsersRegisterPage />} />
        </Route>

          {/* ---------- MainLayout : 헤더/사이드바 있음 ---------- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/chick-entry" element={<ChickEntryPage />} />
            <Route path="/chick-death" element={<ChickDeathPage />} />
            <Route path="/chick-disposal" element={<ChickDisposalPage />} />
            <Route path="/farm-section" element={<FarmSectionPage />} />
            <Route path="/admin-farm-section" element={<AdminFarmSectionPage />} />
          </Route>
      </Routes>
    </Router>
  </AuthProvider>
  );
}
