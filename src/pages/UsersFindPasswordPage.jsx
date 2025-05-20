import React, { useState } from 'react';
import '../styles/usersLoginPage.css';
import logo from "../images/체리부로.jpg";
import { Link, useNavigate } from 'react-router-dom';
import * as usersApi from '../api/usersApi';
import { toast } from 'react-toastify';
import  * as responseStatusCode from '../api/responseStatusCode';

export default function UsersFindPasswordPage() {
  const navigate = useNavigate();

  const [findPassword, setFindPassword] = useState({
    usersId: "",
    usersEmail: ""
  });

  const handleChangeFindPasswordForm = (e) => {
    setFindPassword({ ...findPassword, [e.target.name]: e.target.value });
    console.log(findPassword);
  }

  const findPasswordAction = async () => {
    try {
      const response = await usersApi.findUserPasswordByUsersIdAndUsersEmail(findPassword);
      
      switch (response.status) {
        case responseStatusCode.FIND_USER_PASSWORD_SUCCESS:
          toast.success("임시 비밀번호가 발송되었습니다.");
          navigate('/login');
          break;
        case responseStatusCode.FIND_USER_PASSWORD_FAIL:
          toast.error("아이디와 이메일을 확인해주세요.");
          break;
        default:
          toast.error("다시 시도해주세요.");
          break;
      }
    } catch (error) {
      console.error("Error finding password:", error);
      toast.error("서버와의 연결에 실패했습니다.");
    }
    
  }

  const handleSubmit = (e) => {
  e.preventDefault();
  findPasswordAction();
  };


  return (
    <div className="login-page">
      <div className="logo-container">
        <Link to="/main">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
      </div>

      <div className="login-container">
        <h2 className="login-title">비밀번호 찾기</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>아이디</label>
            <input type="text" 
                   name='usersId'
                   value={findPassword.usersId}
                   onChange={handleChangeFindPasswordForm}
                   placeholder="아이디를 입력하세요" />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input type="email" 
                   name='usersEmail'
                   value={findPassword.usersEmail}
                   onChange={handleChangeFindPasswordForm}
                   placeholder="이메일을 입력하세요" />
          </div>

          <button type="submit" className="login-button">임시 비밀번호 발급</button>
        </form>
      </div>
    </div>
  );
}
