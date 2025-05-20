import React from 'react'
import '../styles/usersLoginPage.css';
import logo from "../images/체리부로.jpg";
import { Link, useNavigate } from 'react-router-dom';
import * as usersApi from "../api/usersApi";
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as responseStatusCode from '../api/responseStatusCode';

export default function UsersFindIdPage() {
  const naviage = useNavigate();

  const [findId, setFindId] = useState({
    usersName: "",
    usersEmail: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    findIdAction();
  }

  const handleChangeFindIdForm = (e) => {
    setFindId({ ...findId, [e.target.name]: e.target.value });
    console.log(findId);
  }

  const findIdAction = async () => {
    try {
      const response = await usersApi.findUserIdByUsersNameAndUsersEmail(findId);

      switch (response.status) {
        case responseStatusCode.FIND_USER_ID_SUCCESS:
          toast.success("아이디 찾기를 성공하셨습니다.");
          naviage('/find-id-result');
          break;
        case responseStatusCode.FIND_USER_ID_FAIL:
          toast.error("이름과 이메일을 확인해주세요.");
          break;
        default:
          toast.error("다시 시도해주세요.");
          break;
      }
    } catch (error) {
      console.error("Error finding ID:", error);
      alert("서버와의 연결에 실패했습니다.");
    }
  }


return (
  <div className="login-page">
  <div className="logo-container">
    <Link to="/main">
      <img src={logo} alt="Logo" className="logo" />
    </Link>
  </div>
    <div className="login-container">
      <h2 className="login-title">아이디 찾기</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이름</label>
          <input type="text" 
          name='usersName'
          value={findId.usersName}
          onChange={handleChangeFindIdForm}
          placeholder="이름을 입력하세요" />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" 
          name='usersEmail'
          value={findId.usersEmail}
          onChange={handleChangeFindIdForm}
          placeholder="이메일을 입력하세요" />
        </div>

        <button type="submit" className="login-button">아이디 찾기</button>
      </form>
    </div>
  </div>
);


}
