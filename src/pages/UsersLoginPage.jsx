import React, { useState } from 'react';
import '../styles/usersLoginPage.css';
import * as usersApi from "../api/usersApi";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function UsersLoginPage() {
  
  const navigate = useNavigate();

  const { login } = useUsersAuth();

  const [users, setUsers] = useState({
    usersId : "",
    usersPassword : ""
  });

  const handleChangeLoginForm = (e) => {
    setUsers({ ...users, [e.target.name]: e.target.value });
    console.log(users);
  };

  const loginAction = async (e) => {
    //페이지 새로고침 방지
    e.preventDefault();

    const responseJsonObject = await usersApi.loginAction(users);

    if(responseJsonObject.accessToken) {

      login(responseJsonObject.accessToken);

      navigate("/farm-section");
    }

    console.log(responseJsonObject);

  }

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>
      <form className="login-form" onSubmit={loginAction}>
        <div className="form-group">
          <label htmlFor="usersId">아이디</label>
          <input
            type="text"
            id="usersId"
            name="usersId"
            onChange={handleChangeLoginForm}
            placeholder="아이디를 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="usersPassword">비밀번호</label>
          <input
            type="password"
            id="usersPassword"
            name="usersPassword"
            onChange={handleChangeLoginForm}
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <button type="submit" className="login-button">
          로그인
        </button>
      </form>
    </div>
  );
}
