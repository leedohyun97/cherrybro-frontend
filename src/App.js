import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import UsersLoginPage from "./pages/UsersLoginPage";
import UsersRegisterPage from "./pages/UsersRegisterPage";
import UsersFindIdPage from "./pages/UsersFindIdPage";
import UsersFindIdResultPage from "./pages/UsersFindIdResultPage";
import UsersFindPasswordPage from "./pages/UsersFindPasswordPage";
import ChickDetailPage from "./pages/ChickDetailPage";
import ChickEntryPage from "./pages/ChickEntryPage";
import ChickEntryDetailPage from "./pages/ChickEntryDetailPage";
import ChickDeathPage from "./pages/ChickDeathPage";
import ChickDeathDetailPage from "./pages/ChickDeathDetailPage";
import ChickDisposalPage from "./pages/ChickDisposalPage";
import ChickDisposalDetailPage from "./pages/ChickDisposalDetailPage";
import FarmSectionPage from "./pages/FarmSectionPage";
import AdminFarmSectionPage from "./pages/AdminFarmSectionPage";
import MainLayout from "./layouts/MainLayout";
import PublicLayout from "./layouts/PublicLayout";
import { AuthProvider } from "./util/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
        <Routes>
          {/* ---------- PublicLayout : 헤더/사이드바 없음 ---------- */}
          <Route element={<PublicLayout />}>
            <Route index path="/login" element={<UsersLoginPage />} />
            <Route path="/register" element={<UsersRegisterPage />} />
            <Route path="/find-id" element={<UsersFindIdPage />} />
            <Route path="/find-id-result" element={<UsersFindIdResultPage />} />
            <Route path="/find-password" element={<UsersFindPasswordPage />} />
          </Route>

          {/* ---------- MainLayout : 헤더/사이드바 있음 ---------- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/farm-section" element={<FarmSectionPage />} />
            <Route
              path="/admin-farm-section"
              element={<AdminFarmSectionPage />}
            />
            <Route
              path="/chick-detail/:farmSectionNo"
              element={<ChickDetailPage />}
            />

            <Route path="/chick-entry" element={<ChickEntryPage />} />
            <Route
              path="/chick-entry/detail"
              element={<ChickEntryDetailPage />}
            />

            <Route path="/chick-death" element={<ChickDeathPage />} />
            <Route
              path="/chick-death/detail"
              element={<ChickDeathDetailPage />}
            />

            <Route path="/chick-disposal" element={<ChickDisposalPage />} />
            <Route
              path="/chick-disposal/detail"
              element={<ChickDisposalDetailPage />}
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
