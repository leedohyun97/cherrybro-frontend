import React, { useEffect, useState } from 'react';
import '../styles/chickPage.css';
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as responseStatus from "../api/responseStatusCode";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function ChickDeathPage() {
    
  /*───── Context 가져오기 START ─────*/
    const { token, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
    /*───── Context 가져오기 END ─────*/

  /* ───────────────────── 데이터 선언 ───────────────────── */

  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  //농장 데이터 선언
  const [farm, setFarm] = useState ({
    farmNo : "",
    farmName : "",
    userNo : ""
  });

  //농장동 데이터 선언
  const [farmSection, setFarmSection] = useState ([]);

  //도태폐기 데이터 선언
  const [chickDeath, setChickDeath] = useState({
      chickDeathNumber : "",
      chickDeathDate : "",
      farmSectionNo : ""
  })

  const handleChangeChickDeath = (e) => {
    setChickDeath({...chickDeath, [e.target.name]: e.target.value});
  }

  //로딩 상태
  const [loading, setLoading] = useState(true);
  
  /* ───────────────────── 함수 선언 ───────────────────── */
  //농장 번호로 농장 가져오기
  const getMyFarm = async (token) => {
    const response = await farmApi.getMyFarm(token);
    setFarm(response.data);
    console.log("getMyFarm", response);
  };

  //농장 번호로 농장동 가져오기
  const getAllFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
    setFarmSection(response.data);
  };

  //도태폐기 등록
  const createChickDeath = async (chickDeathDto) => {
    try {
      const response = await chickDeathApi.createChickDeath(chickDeathDto);
      switch(response.status) {
        case responseStatus.CREATED_CHICK_DEATH_SUCCESS :
          alert("성공적으로 입력되었습니다.");
          navigate("/farm-section"); // 등록 후 이동할 페이지
          break;
        default :
          alert("오류가 발생하였습니다.");
          break;
        }
    } catch (error) {
      console.error("Error creating chick death:", error);
      alert("오류가 발생하였습니다.");
      navigate("/farm-section"); // 등록 후 이동할 페이지
    }
  }
  
  //
useEffect(() => {
  if (!token) {
    navigate("/main");  //토큰 없으면 이동
    return;  //더 이상 실행 안 하고 종료
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const farmResponse = await farmApi.getMyFarm(token);
      setFarm(farmResponse.data);

      const farmNo = farmResponse.data.farmNo;
      const sectionResponse = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
      setFarmSection(sectionResponse.data);

      

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();

}, [token]);
  


  return (
    <div className="page-wrapper">
      <div className="form-container">
        <h2 className="form-title">폐사 수 등록</h2>
        <form className="form-vertical">

          <label>농장 이름</label>
          <input type="text" value={farm.farmName} readOnly />

          <label>농장 구역</label>
          <select
            id="farmSectionNo"
            name="farmSectionNo"
            value={chickDeath.farmSectionNo}
            onChange={handleChangeChickDeath}
          >
            <option>구역 선택</option>
            {farmSection.map((f) => (
              <option key={f.farmSectionNo} value={f.farmSectionNo}>
                {f.farmSectionName}
              </option>
            ))}
          </select>
          <p className="desc">해당 병아리가 폐사 된 구역을 선택하세요.</p>

          <label>폐사 날짜</label>
          <input
            type="date"
            id="chickDeathDate"
            name="chickDeathDate"
            onChange={handleChangeChickDeath}
          />
          <p className="desc">병아리가 폐기 된 날짜입니다.</p>

          <label>폐사 수</label>
          <input
            type="number"
            id="chickDeathNumber"
            name="chickDeathNumber"
            onChange={handleChangeChickDeath}
            placeholder="예: 10000"
          />
          <p className="desc">폐기 된 병아리 수를 숫자로 입력하세요.</p>

          <button
            type="button"
            className="submit-button"
            onClick={() => createChickDeath(chickDeath)}
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
