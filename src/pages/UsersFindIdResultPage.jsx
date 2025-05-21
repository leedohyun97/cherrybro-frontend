import React from 'react';
import '../styles/usersLoginPage.css';
import logo from "../images/체리부로.jpg";
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function UsersFindIdResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const maskedId = location.state?.maskedId;

  if (!maskedId) {
    return (
      <div className="login-page">
        <div className="login-container">
          <p>잘못된 접근입니다.</p>
          <button className="login-button" onClick={() => navigate('/users/find-id')}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
        <div className="logo-container">
          <Link to="/main">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>
      <div className="login-container">
        <h2 className="login-title">아이디 찾기 결과</h2>
        <p className="result-message">
          회원님의 아이디는 <strong>{maskedId}</strong> 입니다.
        </p>
        <button className="login-button" onClick={() => navigate('/login')}>
          로그인하러 가기
        </button>
      </div>
    </div>
  );
}
