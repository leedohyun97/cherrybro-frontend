import React, { useEffect, useState } from 'react';
import '../styles/chickPage.css';
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as responseStatus from "../api/responseStatusCode";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function ChickEntryPage() {

  /*───── Context 가져오기 START ─────*/
  const { token, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
  const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
  const usersRole = users?.usersRole || null; //사용자 권한을 가져온다
  /*───── Context 가져오기 END ─────*/
  
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const [farm, setFarm] = useState ([]);   //농장 데이터 배열 선언
  const [selectedFarmNo, setSelectedFarmNo] = useState(''); //선택된 농장 번호 상태 추가
  const [farmSection, setFarmSection] = useState ([]); //농장동 데이터 배열 선언

  //입추수수 데이터 선언
  const [chickEntry, setChickEntry] = useState({
      chickEntryNumber : "",
      chickEntryDate : "",
      farmSectionNo : ""
  })

  /* ───────────────────── 이벤트 핸들러 ───────────────────── */
   //input/select 요소의 값이 바뀔 때 실행
  const handleChangeChickEntry = (e) => {
    
    const { name, value } = e.target;
    
    setChickEntry(prev => ({...prev, [name]: value}));  // chickEntry 상태 업데이트
  };

  const handleChangeFarm = async (e) => {
    const farmNo = e.target.value;
    setSelectedFarmNo(farmNo); // 선택된 농장 번호 상태 업데이트

    if(farmNo) { 
      const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
      setFarmSection(response.data); // 농장동 데이터 업데이트
    } else {
      setFarmSection([]); // 농장동 데이터 초기화
    }
    
    setChickEntry(prev => ({...prev, farmSectionNo: ''})); // 농장동 초기화
  
  }

  //로딩 상태
  const [loading, setLoading] = useState(true);
  
  /* ───────────────────── 함수 선언 ───────────────────── */
  //사용자 번호로 농장 가져오기
  const getAllFarm = async () => {
    const response = await farmApi.getAllFarm();
    setFarm(response.data);
    console.log("getAllFarm", response);
  };

  //농장 번호로 농장동 가져오기
  const getAllFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
    setFarmSection(response.data);
  };

  //입추수수 등록
  const createChickEntry = async (chickEntryDto) => {
    const response = await chickEntryApi.createChickEntry(chickEntryDto);
    switch(response.status) {
      case responseStatus.CREATED_CHICK_ENTRY_SUCCESS :
        alert("성공적으로 입력되었습니다.");
        navigate("/admin-farm-section"); // 등록 후 이동할 페이지
        break;
      default :
        alert("오류가 발생하였습니다.");
        break;
      }
    };
  
  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const farmResponse = await farmApi.getAllFarm();
        setFarm(farmResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if(token) {
      fetchData();
    }
  }, [token, usersNo]);
  


  return (
    <div className="page-wrapper">
  <div className="form-container">
    <h2 className="form-title">입추수 등록</h2>
    <form className="form-vertical">

      <label>농장 선택</label>
      <select
        id="farmNo"
        name="farmNo"
        value={selectedFarmNo}
        onChange={handleChangeFarm}
      >
        <option value="">농장 선택</option>
        {farm.map(f => (
          <option key={f.farmNo} value={f.farmNo}>
            {f.farmName}
          </option>
        ))}
      </select>
      <p className="desc">병아리가 속한 농장을 선택하세요.</p>

      <label>농장 구역</label>
      <select
        id="farmSectionNo"
        name="farmSectionNo"
        value={chickEntry.farmSectionNo}
        onChange={handleChangeChickEntry}
      >
        <option>-- 구역 선택 --</option>
        {farmSection.map((f) => (
          <option key={f.farmSectionNo} value={f.farmSectionNo}>
            {f.farmSectionName}
          </option>
        ))}
      </select>
      <p className="desc">해당 병아리가 입추된 구역을 선택하세요.</p>

      <label>입추 날짜</label>
      <input
        type="date"
        id="chickEntryDate"
        name="chickEntryDate"
        value={chickEntry.chickEntryDate}
        onChange={handleChangeChickEntry}
      />
      <p className="desc">병아리가 입추된 날짜입니다.</p>

      <label>입추 수</label>
      <input
        type="number"
        id="chickEntryNumber"
        name="chickEntryNumber"
        value={chickEntry.chickEntryNumber}
        onChange={handleChangeChickEntry}
        placeholder="예: 10000"
      />
      <p className="desc">입추된 병아리 수를 숫자로 입력하세요.</p>

      <button
        type="button"
        className="submit-button"
        disabled={
          !chickEntry.farmSectionNo ||
          !chickEntry.chickEntryDate ||
          !chickEntry.chickEntryNumber
        }
        onClick={() => createChickEntry(chickEntry)}
      >
        등록하기
      </button>
    </form>
  </div>
</div>

  );
}
