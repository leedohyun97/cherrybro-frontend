import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const navigate = useNavigate();

  const handleHeaderClick = () => {
    navigate('/main'); // 헤더 클릭 시 메인 페이지로 이동
  }

  return (
    <div className="app-container">
      <header className="app-header" onClick={handleHeaderClick}>CHERRYBRO</header>
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
