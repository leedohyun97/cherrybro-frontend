import React, { useEffect, useState } from 'react';
import '../styles/chickDeathPage.css';
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as responseStatus from "../api/responseStatusCode";
export default function ChickDeathPage() {

  /* ───────────────────── 데이터 선언 ───────────────────── */
  //농장 데이터 선언
  const [farm, setFarm] = useState ({
    farmNo : 1,
    farmName : "",
    userNo : 1
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
  const getFarmByFarmNo = async (farmNo) => {
    const response = await farmApi.getFarm(farmNo);
    setFarm(response.data);
    console.log("getFarmByFarmNo", response);
  };

  //농장 번호로 농장동 가져오기
  const getAllFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
    setFarmSection(response.data);
  };

  //도태폐기 등록
  const createChickDeath = async (chickDeathDto) => {
    const response = await chickDeathApi.createChickDeath(chickDeathDto);
    switch(response.status) {
      case responseStatus.CREATED_CHICK_DEATH_SUCCESS :
        alert("성공적으로 입력되었습니다.");

        // 입력값 초기화
        setChickDeath({
          chickDeathNumber: "",
          chickDeathDate: "",
          farmSectionNo: ""
        });
        
        break;
      default :
        alert("오류가 발생하였습니다.");
        break;
      }
    };
  
  //
  useEffect(() => {
    if(farm.farmNo) {
       //로딩 시작
      setLoading(true);
      getFarmByFarmNo(farm.farmNo);
      getAllFarmSectionByFarmNo(farm.farmNo);
    }
  }, [farm.farmNo]);
  


  return (
    <div className="death-layout">
      <h2 className="death-title">도태폐기 수 등록</h2>
      <form className="death-form-grid">

      <div className="form-row">
        <label>농장 이름</label>
        <div>
          <input 
            type="text" 
            value={farm.farmName} //farmName을 값으로 설정
            readOnly // 수정할 수 없게 설정
          />
        </div>
      </div>
        
        <div className="form-row">
          <label>농장 구역</label>
          <div>
          <select
            id="farmSectionNo"
            name="farmSectionNo"
            value={chickDeath.farmSectionNo}
            onChange={handleChangeChickDeath}
            >
            <option>-- 구역 선택 --</option>
            {farmSection.map((f) => {
              return <option key={f.farmSectionNo} value={f.farmSectionNo}>{f.farmSectionName}</option>;
            })}
          </select>
            <p className="desc">해당 병아리가 입추된 구역을 선택하세요.</p>
          </div>
        </div>

        <div className="form-row">
          <label>입추 날짜</label>
          <div>
            <input 
            type="date"
            id="chickDeathDate"
            name="chickDeathDate"
            onChange={handleChangeChickDeath} />
            <p className="desc">병아리가 입추된 날짜입니다.</p>
          </div>
        </div>

        <div className="form-row">
          <label>입추 수</label>
          <div>
            <input 
            type="number" 
            id="chickDeathNumber"
            name="chickDeathNumber"
            onChange={handleChangeChickDeath}
            placeholder="예: 10000" />
            <p className="desc">총 입추된 병아리 수를 숫자로 입력하세요.</p>
          </div>
        </div>

        <div className="form-row button-row">
        {/* createChickDeath버튼 */}
        <button type="button" onClick={() => createChickDeath(chickDeath)}>등록하기</button>
        </div>
      </form>
    </div>
  );
}
