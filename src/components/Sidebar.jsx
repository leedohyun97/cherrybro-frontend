  import React, { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import '../styles/Sidebar.css';
  import { useUsersAuth } from '../util/authContext';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faHouse, faPen , faPenToSquare, faRightFromBracket, faRightToBracket, faCircleUser , faUserPlus  } from '@fortawesome/free-solid-svg-icons';
  export default function Sidebar() {

    const { token, logout, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersRole = users?.usersRole || null; //사용자 권한을 가져온다
    const [sidebarOpen, setSidebarOpen] = useState(false);

    
    const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동
    
    const handleLogout = () => {
      logout();         // Context의 logout() 호출 → 쿠키 삭제 + 상태 초기화
      navigate('/main');  // 로그인 페이지로 이동
    };

 return (
    <>
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          {token ? (
            <>
              {usersRole === 'ROLE_ADMIN' && (
                <>
                  <li><Link to="/admin-farm-section"><FontAwesomeIcon icon={faHouse} className="sidebar-icon" />메인</Link></li>
                  <li><Link to="/chick-entry"><FontAwesomeIcon icon={faPenToSquare} className="sidebar-icon" />입추수수 등록</Link></li>
                </>
              )}

              {usersRole === 'ROLE_FARMER' && (
                <>
                  <li><Link to="/farm-section"><FontAwesomeIcon icon={faHouse} className="sidebar-icon" />메인</Link></li>
                  <li><Link to="/chick-disposal"><FontAwesomeIcon icon={faPenToSquare} className="sidebar-icon" />도사 등록</Link></li>
                  <li><Link to="/chick-death"><FontAwesomeIcon icon={faPenToSquare} className="sidebar-icon" />폐사 등록</Link></li>
                </>
              )}

              <li>
                <button onClick={handleLogout} className="logout-link">
                  <FontAwesomeIcon icon={faRightFromBracket} className="sidebar-icon" />
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login"><FontAwesomeIcon icon={faRightToBracket} className="sidebar-icon" />로그인</Link></li>
              <li><Link to="/register"><FontAwesomeIcon icon={faUserPlus} className="sidebar-icon" />회원가입</Link></li>
            </>
          )}
        </ul>
      </nav>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
    