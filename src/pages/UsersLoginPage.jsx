import React, { useState } from 'react';
import '../styles/usersLoginPage.css';
import * as usersApi from "../api/usersApi";
import { useUsersAuth } from "../util/authContext";
import { Link, useNavigate } from 'react-router-dom';
import logo from "../images/체리부로.jpg";

export default function UsersLoginPage() {

  /*——————————— 훅 선언 ———————————*/
  const navigate = useNavigate();
  const { login, users } = useUsersAuth();
  
  
  /*——————————— 상태(state) 선언 ———————————*/
  const [loginUsers, setLoginUsers] = useState({
    usersId : "",
    usersPassword : ""
  });
  
  const [errors, setErrors] = useState({
    usersId: "",
    usersPassword: "",
    loginFail: "" // 로그인 실패 시 출력할 에러 메시지
  });
  
  const [shake, setShake] = useState(false);
  
  
  /*——————————— 입력값 변경 핸들러 ———————————*/
  const handleChangeLoginForm = (e) => {
    setLoginUsers({ ...loginUsers, [e.target.name]: e.target.value });
    console.log(loginUsers);
    
    // 입력하면 에러 메시지 삭제
    setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: "", loginFail: "" }));
  };
  
  /*——————————— 입력값 유효성 검사 함수 ———————————*/
  const errorMessage = () => {
    const newErrors = {};
    if (!loginUsers.usersId || !loginUsers.usersPassword) {
      newErrors.loginFail = "아이디와 비밀번호를 확인해주세요.";
    }
    return newErrors;
  };
  
  
  /*——————————— 로그인 실행 함수 ———————————*/
  const loginAction = async (e) => {
    e.preventDefault(); //페이지 새로고침 방지

    /* 입력값 검사 */
    const errorMessages = errorMessage();
    if(Object.keys(errorMessages).length > 0) {
      setErrors({ ...errors, ...errorMessages });
      return;
    }
    try {
      const responseJsonObject = await usersApi.loginAction(loginUsers);

      if(responseJsonObject.accessToken) {

        login(responseJsonObject.accessToken);

        const getUser = await usersApi.getUsers(responseJsonObject.accessToken);

        if(getUser.data.usersRole === "ROLE_ADMIN") {
          navigate("/admin-farm-section");
        }

        if(getUser.data.usersRole === "ROLE_FARMER") {
          navigate("/farm-section");
        }
      } else {

        throw new Error("로그인 실패");
      }

      console.log(responseJsonObject);
    } catch (error) {
      /* 로그인 실패 시 에러 메시지 설정 */
      setErrors({ ...errors, loginFail: "아이디와 비밀번호를 확인해주세요." });
      setShake(true); //흔들림 효과
      setTimeout(() => setShake(false), 500); //0.5초 지속
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
        <h2 className="login-title">로그인</h2>

        {/* 흔들림 애니메이션이 적용되는 폼, shake 값이 true면 흔들림*/}
        <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={loginAction}>
          <div className="form-group">
            <label htmlFor="usersId">아이디</label>
            <input
              type="text"
              id="usersId"
              name="usersId"
              onChange={handleChangeLoginForm}
              className={errors.loginFail ? "input-error" : ""}
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
              className={errors.loginFail ? "input-error" : ""}
              placeholder="비밀번호를 입력하세요"
              />
          </div>

            {/* 로그인 실패 메시지 */}
            {errors.loginFail && (
              <div className="form-group">
                <span className="error-message">{errors.loginFail}</span>
              </div>
            )}

          <div className="login-links">
            <a href="#">아이디 찾기</a>
            <span>|</span>
            <a href="#">비밀번호 찾기</a>
            <span>|</span>
            <a href="/register">회원가입</a>
          </div>


          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
