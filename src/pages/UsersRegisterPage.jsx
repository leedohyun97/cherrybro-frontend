import React, { useRef, useState } from 'react';
import '../styles/usersRegisterPage.css';
import { Link, useNavigate } from 'react-router-dom';
import * as usersApi from "../api/usersApi";
import * as responseStatus from "../api/responseStatusCode";
import logo from "../images/체리부로.jpg"
import { toast } from 'react-toastify';

export default function UsersRegisterPage() {
  const navigate = useNavigate();
  /* ————— useRef 선언(포커싱 용도) start ————— */
  const usersIdRef = useRef();
  const usersPasswordRef = useRef();
  const usersNameRef = useRef();
  const usersEmailRef = useRef();
  const usersPhoneRef = useRef();
  const farmNameRef = useRef();
  /* ————— useRef 선언(포커싱 용도) end ————— */

  /* ————— useState 선언 start ————— */
  const [users, setUsers] = useState({
    usersId : "",
    usersPassword : "",
    usersName : "",
    usersEmail : "",
    usersPhone : "",
    farmName : "",
  });
  
  const [farmSections, setFarmSections] = useState(['1동']);
  
  const [sectionCount, setSectionCount] = useState(1);

  const [errors, setErrors] = useState({});
  
  const [shake, setShake] = useState(false);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const phoneRegex = /^[0-9]{10,11}$/;

  /* ————— useState 선언 end ————— */
  


  /* —————————— handleChagne 선언 start —————————— */
  const handleUsersChange = (e) => {
    setUsers({
      ...users, [e.target.name]:e.target.value
    });

    // 입력값 바꾸면 해당 필드 에러만 삭제
    if (errors[e.target.name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  }
  
  const handleSectionChange = (index, value) => {
    const newSections = [...farmSections];
    newSections[index] = value;
    setFarmSections(newSections);

    // 농장동 입력값 바꾸면 에러 삭제
    if (errors.farmSections) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.farmSections;
        return newErrors;
      });
    }
  }

  const handleSectionCountChange = (e) => {
    const count = Math.max(1, parseInt(e.target.value, 10) || 1); //최소 1개 보장
    setSectionCount(count);
    setFarmSections(Array.from({ length: count }, (_, i) => `${i + 1}동`));

    // 에러가 있을 경우 제거
    if (errors.farmSections) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.farmSections;
        return newErrors;
      });
    }
  }  
  /* —————————— handleChagne 선언 end —————————— */
  


  /* ———————————————————— 함수 선언 start ———————————————————— */
  const focusField = (fieldName) => {
    const refMap = {
    usersId: usersIdRef,
    usersPassword: usersPasswordRef,
    usersName: usersNameRef,
    usersEmail: usersEmailRef,
    usersPhone: usersPhoneRef,
    farmName: farmNameRef
    };

    const targetRef = refMap[fieldName];
    if (targetRef && targetRef.current) {
      targetRef.current.focus();
    }
  }
  
  const joinAction = async (e) => {
    e.preventDefault();

    /*—————— 입력값 검사 start —————*/
    const newErrors = {};

    if (!users.usersId || users.usersId.length < 4) {
      newErrors.usersId = "아이디는 최소 4자 이상이어야 합니다.";
      focusField("usersId");

    } else if (!users.usersPassword || users.usersPassword.length < 6) {
      newErrors.usersPassword = "비밀번호는 최소 6자 이상이어야 합니다.";
      focusField("usersPassword");

    } else if (!users.usersName) {
      newErrors.usersName = "이름을 입력하세요.";
      focusField("usersName");

    } else if (!emailRegex.test(users.usersEmail)) {
      newErrors.usersEmail = "유효한 이메일을 입력하세요.";
      focusField("usersEmail");

    } else if (!phoneRegex.test(users.usersPhone)) {
      newErrors.usersPhone = "전화번호는 숫자만 입력하며 10~11자리여야 합니다.";
      focusField("usersPhone");

    } else if (!users.farmName) {
      newErrors.farmName = "농장 이름을 입력하세요.";
      focusField("farmName");

    } else if (farmSections.length === 0 || farmSections.some(section => !section.trim())) {
      newErrors.farmSections = "농장동 이름을 모두 입력하세요.";
      focusField("farmSections");
    }

    const userDuplicateCheck = await usersApi.checkUserIdDuplicate(users.usersId);
    if (userDuplicateCheck.data === true) {
      newErrors.usersId = "이미 사용중인 아이디입니다.";
      if (usersIdRef.current) {
        usersIdRef.current.focus();
      }
    };

    // 에러가 있으면 상태에 저장하고 return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 에러 없으면 초기화
    setErrors({});
    /*—————— 입력값 검사 end —————*/
    
    const saveUser = {
      ...users, farmSections : farmSections
    };

    console.log("saveUser : ", saveUser);

    const responseJsonObject = await usersApi.createUsers(saveUser);

    console.log("responseJsonObject : ", responseJsonObject);

    switch(responseJsonObject.status) {
      case responseStatus.CREATED_USER_SUCCESS:
        navigate("/login");
        toast.success("회원가입이 완료되었습니다.");
        break;
      default:
        toast.error("회원가입에 실패하였습니다. 다시 시도해주세요.");
        navigate("/register");
        break;
    }
  }

  const addFarmSection = () => {
    setFarmSections([...farmSections, `${farmSections.length + 1}동`]);
  }

  /* ———————————————————— 함수 선언 end ———————————————————— */


  return (
    <div className="register-page">
      <div className="logo-container">
        <Link to="/main">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="register-container">
        <h2>회원가입</h2>
        <form className="register-form" onSubmit={joinAction}>

          <label>아이디</label>
          <input
            type="text"
            name="usersId"
            value={users.usersId}
            onChange={handleUsersChange}
            placeholder="아이디를 입력하세요"
            className={errors.usersId ? "error-input" : ""}
            ref={usersIdRef}
          />
          {errors.usersId && <p className="error-message">{errors.usersId}</p>}


          <label>비밀번호</label>
          <input
            type="password"
            name="usersPassword"
            value={users.usersPassword}
            onChange={handleUsersChange}
            placeholder="비밀번호를 입력하세요"
            className={errors.usersPassword ? "error-input" : ""}
          />
          {errors.usersPassword && <p className="error-message">{errors.usersPassword}</p>}


          <label>농장주 성함</label>
          <input
            type="text"
            name="usersName"
            value={users.usersName}
            onChange={handleUsersChange}
            placeholder="이름을 입력하세요"
            className={errors.usersName ? "error-input" : ""}
          />
          {errors.usersName && <p className="error-message">{errors.usersName}</p>}


          <label>이메일</label>
          <input
            type="email"
            name="usersEmail"
            value={users.usersEmail}
            onChange={handleUsersChange}
            placeholder="이메일을 입력하세요"
            className={errors.usersEmail ? "error-input" : ""}
          />
          {errors.usersEmail && <p className="error-message">{errors.usersEmail}</p>}


          <label>전화번호</label>
          <input
            type="text"
            name="usersPhone"
            value={users.usersPhone}
            onChange={handleUsersChange}
            placeholder="전화번호를 입력하세요"
            className={errors.usersPhone ? "error-input" : ""}
          />
          {errors.usersPhone && <p className="error-message">{errors.usersPhone}</p>}


          <label>농장 이름</label>
          <input
            type="text"
            name="farmName"
            value={users.farmName}
            onChange={handleUsersChange}
            placeholder="농장 이름을 입력하세요"
            className={errors.farmName ? "error-input" : ""}
          />
          {errors.farmName && <p className="error-message">{errors.farmName}</p>}


          <label>농장동 개수</label>
          <input
            type="number"
            min="1"
            value={sectionCount}
            onChange={handleSectionCountChange}
            placeholder="예: 3"
            />
            {errors.farmSections && <p className="error-message">{errors.farmSections}</p>}

          <button type="submit" className="join-button">회원가입</button>
          
        </form>
      </div>
    </div>
  );
}
