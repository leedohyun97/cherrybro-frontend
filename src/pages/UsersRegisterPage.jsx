import React, { useState } from 'react';
import '../styles/usersRegisterPage.css';
import { useNavigate } from 'react-router-dom';
import * as usersApi from "../api/usersApi";
import * as responseStatus from "../api/responseStatusCode";

export default function UsersRegisterPage() {
  
  /* Navigate 선언 */
  const navigate = useNavigate();

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
  /* ————— useState 선언 end ————— */
  

  /* —————————— handleChagne 선언 start —————————— */
  const handeUsersChange = (e) => {
    setUsers({
      ...users, [e.target.name]:e.target.value
    });
  }
  
  const handleSectionChange = (index, value) => {
    const newSections = [...farmSections];
    newSections[index] = value;
    setFarmSections(newSections);
  }
  /* —————————— handleChagne 선언 end —————————— */
  
  /* ———————————————————— 함수 선언 start ———————————————————— */
  const joinAction = async (e) => {
    e.preventDefault();

    const saveUser = {
      ...users, farmSections : farmSections
    };

    console.log("saveUser : ", saveUser);

    const responseJsonObject = await usersApi.createUsers(saveUser);

    console.log("responseJsonObject : ", responseJsonObject);

    switch(responseJsonObject.status) {
      case responseStatus.CREATED_USER_SUCCESS:
        navigate("/farm-section");
        break;
      default:
        alert("오류가 발생하였습니다.");
        break;
    }
  }

  const addFarmSection = () => {
    setFarmSections([...farmSections, `${farmSections.length + 1}동`]);
  }
  
  const removeFarmSection = (index) => {
    // 삭제하고 싶은 번호(index)만 빼고 새로운 배열로 만듬
    const newSections = farmSections.filter((_, i) => i !== index);
    setFarmSections(newSections);
  }
  /* ———————————————————— 함수 선언 start ———————————————————— */

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>회원가입</h2>
        <form className="register-form" onSubmit={joinAction}>

          <label>아이디</label>
          <input
            type="text"
            name="usersId"
            value={users.usersId}
            onChange={handeUsersChange}
            placeholder="아이디를 입력하세요"
            required
          />

          <label>비밀번호</label>
          <input
            type="password"
            name="usersPassword"
            value={users.usersPassword}
            onChange={handeUsersChange}
            placeholder="비밀번호를 입력하세요"
            required
          />

          <label>이름</label>
          <input
            type="text"
            name="usersName"
            value={users.usersName}
            onChange={handeUsersChange}
            placeholder="이름을 입력하세요"
            required
          />

          <label>이메일</label>
          <input
            type="email"
            name="usersEmail"
            value={users.usersEmail}
            onChange={handeUsersChange}
            placeholder="이메일을 입력하세요"
            required
          />

          <label>전화번호</label>
          <input
            type="text"
            name="usersPhone"
            value={users.usersPhone}
            onChange={handeUsersChange}
            placeholder="전화번호를 입력하세요"
            required
          />

          <label>농장 이름</label>
          <input
            type="text"
            name="farmName"
            value={users.farmName}
            onChange={handeUsersChange}
            placeholder="농장 이름을 입력하세요"
            required
          />

          <label>농장동 이름</label>
          {farmSections.map((section, index) => (
            <div key={index} className="farm-section-row">
              <input
                type="text"
                name={`farmSections[${index}]`}
                value={section}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                placeholder={`${index + 1}동 이름`}
                required
              />
              {farmSections.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeFarmSection(index)}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-button" onClick={addFarmSection}>+ 농장동 추가</button>

          <button type="submit" className="join-button">회원가입</button>
        </form>
      </div>
    </div>
  );
}
