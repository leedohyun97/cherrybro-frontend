import "../styles/Sidebar.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUsersAuth } from "../util/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../images/체리부로.png";
import user_icon from "../images/user_icon.png";
import {
  faHouse,
  faPenToSquare,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const { token, logout, users } = useUsersAuth();
  const usersRole = users?.usersRole || null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/main");
  };

  return (
    <>
      <button
        className={`hamburger ${sidebarOpen ? "white" : "black"}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* 로고 */}
        <div className="sidebar-logo">
          <img src={logo} alt="Cherrybro 로고" />
        </div>

        {/* 프로필 */}
        {token && (
          <div className="sidebar-profile">
            <img src={user_icon} alt="사용자 프로필" />
            <div className="profile-text">
              <div className="profile-name">{users.usersName}</div>
              <div className="profile-role">
                {usersRole === "ROLE_ADMIN" ? "관리자" : "농장주"}
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 리스트 */}
        <ul className="sidebar-menu">
          {token ? (
            <>
              {usersRole === "ROLE_ADMIN" && (
                <>
                  <li>
                    <Link to="/admin-farm-section">
                      <FontAwesomeIcon
                        icon={faHouse}
                        className="sidebar-icon"
                      />
                      메인
                    </Link>
                  </li>
                  <li>
                    <Link to="/chick-entry">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="sidebar-icon"
                      />
                      입추 등록
                    </Link>
                  </li>
                  <li>
                    <Link to="/chick-entry/detail">
                      <FontAwesomeIcon
                        icon={faClockRotateLeft}
                        className="sidebar-icon"
                      />
                      입추 내역
                    </Link>
                  </li>
                </>
              )}

              {usersRole === "ROLE_FARMER" && (
                <>
                  <li>
                    <Link to="/farm-section">
                      <FontAwesomeIcon
                        icon={faHouse}
                        className="sidebar-icon"
                      />
                      메인
                    </Link>
                  </li>
                  <li>
                    <Link to="/chick-reduce">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="sidebar-icon"
                      />
                      도태/폐사 등록
                    </Link>
                  </li>
                  <li>
                    <Link to="/chick-disposal/detail">
                      <FontAwesomeIcon
                        icon={faClockRotateLeft}
                        className="sidebar-icon"
                      />
                      도사 내역
                    </Link>
                  </li>
                  <li>
                    <Link to="/chick-death/detail">
                      <FontAwesomeIcon
                        icon={faClockRotateLeft}
                        className="sidebar-icon"
                      />
                      폐사 내역
                    </Link>
                  </li>
                </>
              )}

              <li>
                <button onClick={handleLogout} className="logout-link">
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="sidebar-icon"
                  />
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">
                  <FontAwesomeIcon
                    icon={faRightToBracket}
                    className="sidebar-icon"
                  />
                  로그인
                </Link>
              </li>
              <li>
                <Link to="/register">
                  <FontAwesomeIcon icon={faUserPlus} className="sidebar-icon" />
                  회원가입
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
