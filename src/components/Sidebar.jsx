import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/login">로그인</Link></li>
        <li><Link to="/register">회원가입</Link></li>
        <li><Link to="/farm-section">메인</Link></li>
        <li><Link to="/chick-entry">입추수수 등록</Link></li>
        <li><Link to="/chick-death">도태폐기 등록</Link></li>
      </ul>
    </nav>
  );
}
