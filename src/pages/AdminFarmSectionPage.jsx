import React, { useEffect, useState } from 'react';
import '../styles/farmSectionPage.css';
import * as usersApi from "../api/usersApi";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as chickDeathApi from "../api/chickDeathApi";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function AdminFarmSectionPage() {

    /*————— Context 가져오기 START —————*/
    const { token, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
    const usersRole = users?.usersRole || null; //사용자 번호를 가져온다
    /*————— Context 가져오기 END —————*/

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  //농장 데이터를 배열로 초기화
  const [farm, setFarm] = useState([]);

  //농장동 데이터를 배열로 초기화
  const [farmSection, setFarmSection] = useState([]);

  //입추수수 데이터를 배열로 초기화
  const [chickEntry, setChickEntry] = useState([]);

  //도태폐기 데이터를 배열로 초기화
  const [chickDeath, setChickDeath] = useState([]);

  //로딩 상태
  const [loading, setLoading] = useState(true);


  /* ───────────────────── rows 생성 ───────────────────── */
  //farmSection(농장동) 기준으로 rows를 생성\
  const rows = farmSection.map((section) => {


    //해당 농장동의 입추 데이터 찾기
    const matchingEntry = chickEntry.find(entry => entry.farmSectionNo === section.farmSectionNo);

    //해당 농장동의 폐사 데이터 찾기
    const matchingDeath = chickDeath.find(death => death.farmSectionNo === section.farmSectionNo);

    //입추 수, 없으면 0
    const entryNumber = matchingEntry ? matchingEntry.chickEntryNumber : 0;

    //도태 폐사 수, 없으면 0
    const deathNumber = matchingDeath ? matchingDeath.chickDeathNumber : 0;

    /*—————————— 일령 계산 ——————————*/
    //오늘 날짜 (시간 제거)
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);  //시간을 00:00:00으로 맞춤

    // 입추 날짜 (시간 제거)
    const entryDate = matchingEntry && matchingEntry.chickEntryDate ? new Date(matchingEntry.chickEntryDate) : null;
    if (entryDate) entryDate.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 맞춤

    // 일령 계산
    const age = entryDate ? Math.floor((today - entryDate) / (1000 * 60 * 60 * 24)) + 1 : null;
    /*—————————— 일령 계산 ——————————*/

    //farmSection의 farmNo로 farmName 찾아오기
    const farmInfo = farm.find(f => f.farmNo === section.farmNo);

    //row 데이터 반환 (항상 farmSection 기준으로 출력)
    return {
        farmSectionNo: section.farmSectionNo,  // 농장동 번호
        farmName: farmInfo ? farmInfo.farmName : '농장 없음', // 농장 이름 매칭
        farmSectionName: section.farmSectionName || '',  // 농장동 이름
        lastEntry: matchingEntry?.chickEntryDate || '',  // 최근 입추일 (없으면 빈값)
        entry: entryNumber,                     // 입추 수
        death: deathNumber,                     // 도태 폐사 수
        live: entryNumber - deathNumber,        // 현재 마릿수
        age: age || ''                                // 일령 (없으면 null)
    };

  })// rows 배열을 정렬한다
  .sort((a, b) => {
  
      // 1. 농장 이름(farmName) 비교 → 알파벳 순으로 정렬
      if (a.farmName < b.farmName) 
          return -1; // a 농장이 b 농장보다 이름이 앞이면 a를 앞으로
  
      if (a.farmName > b.farmName) 
          return 1;  // a 농장이 b 농장보다 이름이 뒤면 b를 앞으로
  
      // 2. 농장 이름이 같을 경우 → 농장동 이름에서 숫자 추출해서 비교
  
      // farmSectionName(예: '1동', '3동')에서 숫자만 추출하는 함수
      const getNumber = (name) => 
          parseInt(                             // 문자열을 숫자로 바꿈
              name.replace(/[^0-9]/g, ''),     // 숫자가 아닌 모든 문자 제거 (예: '강남1동' → '1')
              10                               // 10진수
          ) 
          || 0;                                // 숫자 없으면 0 반환
  
      // 숫자 비교 → 숫자가 작은 동이 앞으로
      return getNumber(a.farmSectionName) - getNumber(b.farmSectionName);
  
  });
  


  /* ───────────────────── 함수 선언 ───────────────────── */

  //모든 농장 정보 가져오기
  const getAllFarm = async () => {
    const response = await farmApi.getAllFarm();

    console.log("getAllFarm:", response.data);
    
    setFarm(response.data);
  };

  //농장 번호로 농장동 정보 가져오기
  const getAllFarmSection = async () => {
    const response = await farmSectionApi.getAllFarmSection();
    console.log("getAllFarmSection response:", response.data);
    setFarmSection(response.data);  // 농장동 배열로 설정
  }

  //농장동 번호로 입추수수 정보 가져오기
  const getAllChickEntries = async () => {
    const response = await chickEntryApi.getAllChickEntries();
    
    // 중복된 데이터 추가 방지 (기존에 있는 farmSectionNo와 같은 항목은 추가하지 않음)
    setChickEntry(prevEntries => {
      const newEntries = response.data.filter(entry => 
        !prevEntries.some(existingEntry => existingEntry.farmSectionNo === entry.farmSectionNo)
      );
      return [...prevEntries, ...newEntries];
    });
  }
  //농장동 번호로 도태폐기 정보 가져오기
  const getAllChickDeath = async () => {
    const response = await chickDeathApi.getAllChickDeath();
    
    // 중복된 데이터 추가 방지
    setChickDeath(prevDeaths => {
      const newDeaths = response.data.filter(death => 
        !prevDeaths.some(existingDeath => existingDeath.farmSectionNo === death.farmSectionNo)
      );
      return [...prevDeaths, ...newDeaths];
    });
  }
  

  useEffect(() => {
    
    if (!token) {
      navigate("/main");  //큰 없으면 이동
      return;  //더 이상 실행 안 하고 종료
    }

    const fetchAllData = async () => {
        try {
            setLoading(true);

            /*** 1단계: Farm 전체 가져오기 ***/
            const farmResponse = await farmApi.getAllFarm();
            setFarm(farmResponse.data);

            /*** 2단계: FarmSection 전체 가져오기 ***/
            const sectionResponse = await farmSectionApi.getAllFarmSection();
            setFarmSection(sectionResponse.data);

            /*** 3단계: Entry 전체 가져오기 ***/
            const entryResult = await chickEntryApi.getAllChickEntries();
            setChickEntry(entryResult.data);

            /*** 4단계: Death 전체 가져오기 ***/
            const deathResult = await chickDeathApi.getAllChickDeath();
            setChickDeath(deathResult.data);

        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAllData();

}, []); //컴포넌트 처음 마운트될 때만 실행


  /* ─── 집계 데이터 계산 ─────────────────── */
  const totalEntry = chickEntry.reduce((total, entry) => total + entry.chickEntryNumber, 0);
  const totalDeath = chickDeath.reduce((total, death) => total + death.chickDeathNumber, 0);
  const totalLive = totalEntry - totalDeath;

  return (
    <div className="farm-page">
      {/* ─── 상단 카드 3개 ─────────────────── */}
      <section className="summary-wrap">
        {[ 
          { label: '입추 수', value: totalEntry.toLocaleString() },
          { label: '누적 폐사', value: totalDeath.toLocaleString() },
          { label: '현재 마릿수', value: totalLive.toLocaleString() },
        ].map(c => (
          <div key={c.label} className="summary-card">
            <p className="card-label">{c.label}</p>
            <p className="card-value">{c.value}</p>
          </div>
        ))}
      </section>

      {/* ─── 테이블 ────────────────────────── */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>농장</th>
              <th>동</th>
              <th>최근 입추일</th>
              <th>일령</th>
              <th>사육수수</th>
              <th>누적 폐사</th>
              <th>현재 마릿수</th>
              <th>폐사율</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, index) => (
              <tr key={index}>
                <td>{r.farmName || '농장 없음'}</td>
                <td>{r.farmSectionName || '동 없음'}</td>
                <td>{r.lastEntry || '없음'}</td>
                <td>{`${r.age}일령`}</td>
                <td>{r.entry !== undefined ? r.entry.toLocaleString() : '0'}</td>
                <td>{r.death !== undefined ? r.death.toLocaleString() : '0'}</td>
                <td>{r.live !== undefined ? r.live.toLocaleString() : '0'}</td>
                <td>{r.entry ? ((r.death / r.entry) * 100).toFixed(2) + '%' : '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
