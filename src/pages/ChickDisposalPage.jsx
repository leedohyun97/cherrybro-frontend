import React, { useEffect, useState } from 'react';
import '../styles/chickPage.css';
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import * as responseStatus from "../api/responseStatusCode";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function ChickDisposalPage() {
    
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

  //도사 데이터 선언
  const [chickDisposal, setChickDisposal] = useState({
      chickDisposalNumber : "",
      chickDisposalDate : "",
      farmSectionNo : ""
  })

  const handleChangeChickDisposal = (e) => {
    setChickDisposal({...chickDisposal, [e.target.name]: e.target.value});
  }

  //로딩 상태
  const [loading, setLoading] = useState(true);
  
  /* ───────────────────── 함수 선언 ───────────────────── */
  //농장 번호로 농장 가져오기
  const getFarmByUsersNo = async (usersNo) => {
    const response = await farmApi.getFarmByUsersNo(usersNo);
    setFarm(response.data);
    console.log("getFarmByUsersNo", response);
  };

  //농장 번호로 농장동 가져오기
  const getAllFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
    setFarmSection(response.data);
  };

  //도사 등록
  const createChickDisposal = async (chickDisposalDto) => {
    const response = await chickDisposalApi.createChickDisposal(chickDisposalDto);
    switch(response.status) {
      case responseStatus.CREATED_CHICK_DISPOSAL_SUCCESS :
        alert("성공적으로 입력되었습니다.");
        navigate("/farm-section"); // 등록 후 이동할 페이지
        break;
      default :
        alert("오류가 발생하였습니다.");
        break;
      }
    };
  
  //
useEffect(() => {
  if (!token) {
    navigate("/main");  //토큰 없으면 이동
    return;  //더 이상 실행 안 하고 종료
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const farmResponse = await farmApi.getFarmByUsersNo(usersNo);
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

  if(token) {
    fetchData();
  }

}, [token, usersNo]);
  


  return (
    <div className="page-wrapper">
      <div className="form-container">
        <h2 className="form-title">도사 수 등록</h2>
        <form className="form-vertical">
          
          <div className="form-row-horizontal">
          <label>농장 이름</label>
          <input type="text" value={farm.farmName} readOnly />
          </div>
          
          <div className="form-row-horizontal">
          <label>농장 구역</label>
          <select
            name="farmSectionNo"
            value={chickDisposal.farmSectionNo}
            onChange={handleChangeChickDisposal}
          >
            <option>구역 선택</option>
            {farmSection.map(f => (
              <option key={f.farmSectionNo} value={f.farmSectionNo}>
                {f.farmSectionName}
              </option>
            ))}
          </select>
          </div>
          <p className="desc">해당 병아리가 도사된 구역을 선택하세요.</p>


          <div className="form-row-horizontal">
          <label>도사 날짜</label>
          <input
            type="date"
            name="chickDisposalDate"
            onChange={handleChangeChickDisposal}
          />
          </div>
          <p className="desc">병아리가 도사된 날짜입니다.</p>
          

          <div className="form-row-horizontal">
          <label>도사 수</label>
          <input
            type="number"
            name="chickDisposalNumber"
            onChange={handleChangeChickDisposal}
            placeholder="예: 10000"
          />
          </div>
          <p className="desc">도사된 병아리 수를 숫자로 입력하세요.</p>
          
          <button
            type="button"
            className="submit-button"
            onClick={() => createChickDisposal(chickDisposal)}
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
