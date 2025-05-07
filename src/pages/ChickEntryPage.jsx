import React, { useEffect, useState } from 'react';
import '../styles/chickEntryPage.css';
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as responseStatus from "../api/responseStatusCode";
export default function ChickEntryPage() {

  /* ───────────────────── 데이터 선언 ───────────────────── */
  //농장 데이터 선언
  const [farm, setFarm] = useState ({
    farmNo : 1,
    farmName : "",
    userNo : 1
  });

  //농장동 데이터 선언
  const [farmSection, setFarmSection] = useState ([]);

  //입추수수 데이터 선언
  const [chickEntry, setChickEntry] = useState({
      chickEntryNumber : "",
      chickEntryDate : "",
      farmSectionNo : ""
  })

  const handleChangeChickEntry = (e) => {
    setChickEntry({...chickEntry, [e.target.name]: e.target.value});
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

  //입추수수 등록
  const createChickEntry = async (chickEntryDto) => {
    const response = await chickEntryApi.createChickEntry(chickEntryDto);
    switch(response.status) {
      case responseStatus.CREATED_CHICK_ENTRY_SUCCESS :
        alert("성공적으로 입력되었습니다.");

        // 입력값 초기화
        setChickEntry({
          chickEntryNumber: "",
          chickEntryDate: "",
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
    <div className="entry-layout">
      <h2 className="entry-title">입추수 등록</h2>
      <form className="entry-form-grid">

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
            value={chickEntry.farmSectionNo}
            onChange={handleChangeChickEntry}
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
            id="chickEntryDate"
            name="chickEntryDate"
            onChange={handleChangeChickEntry} />
            <p className="desc">병아리가 입추된 날짜입니다.</p>
          </div>
        </div>

        <div className="form-row">
          <label>입추 수</label>
          <div>
            <input 
            type="number" 
            id="chickEntryNumber"
            name="chickEntryNumber"
            onChange={handleChangeChickEntry}
            placeholder="예: 10000" />
            <p className="desc">총 입추된 병아리 수를 숫자로 입력하세요.</p>
          </div>
        </div>

        <div className="form-row button-row">
        {/* createChickEntry버튼 */}
        <button type="button" onClick={() => createChickEntry(chickEntry)}>등록하기</button>
        </div>
      </form>
    </div>
  );
}
