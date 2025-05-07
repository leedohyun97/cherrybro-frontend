import React, { useEffect, useState } from 'react';
import '../styles/farmSectionPage.css';
import * as usersApi from "../api/usersApi";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as chickDeathApi from "../api/chickDeathApi";
import { useUsersAuth } from "../util/authContext";

export default function FarmSectionPage() {

    /***** Context 가져오기 START *****/
    const { token, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
    /***** Context 가져오기 END *****/

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const [farm, setFarm] = useState({
    farmNo: "",
    farmName: "",
    usersNo: ""
  });

  //농장동 데이터를 배열로 초기화
  const [farmSection, setFarmSection] = useState([]);

  //입추수수 데이터
  const [chickEntry, setChickEntry] = useState([]);

  //도태폐기 데이터
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

  //일령 계산
  const today = new Date();
  const entryDate = matchingEntry && matchingEntry.chickEntryDate ? new Date(matchingEntry.chickEntryDate) : null;
  const age = entryDate ? Math.floor((today - entryDate) / (1000 * 60 * 60 * 24)) + 1 : null;

  //row 데이터 반환 (항상 farmSection 기준으로 출력)
  return {
      farmSectionNo: section.farmSectionNo,  // 농장동 번호
      farmName: farm.farmName || '',         // 농장 이름 (없으면 빈값)
      farmSectionName: section.farmSectionName || '',  // 농장동 이름
      lastEntry: matchingEntry?.chickEntryDate || '',  // 최근 입추일 (없으면 빈값)
      entry: entryNumber,                     // 입추 수
      death: deathNumber,                     // 도태 폐사 수
      live: entryNumber - deathNumber,        // 현재 마릿수
      age: age || ''                                // 일령 (없으면 null)
  };

}).sort((a, b) => {
  //farmSectionName 안의 숫자를 기준으로 정렬
  const getNumber = (name) => parseInt(name.replace(/[^0-9]/g, ''), 10) || 0;
  return getNumber(a.farmSectionName) - getNumber(b.farmSectionName);
});


  /* ───────────────────── 함수 선언 ───────────────────── */

  //사용자 번호로 농장 정보 가져오기
  const getFarmByUsersNo = async (usersNo) => {
    const response = await farmApi.getFarmByUsersNo(usersNo);
    console.log(usersNo);
    console.log("getFarmByFarmNo response:", response.data);
    setFarm(response.data);
  };

  //농장 번호로 농장동 정보 가져오기
  const getFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
    console.log("getFarmSectionByFarmNo response:", response.data);
    setFarmSection(response.data);  // 농장동 배열로 설정
  }

  //농장동 번호로 입추수수 정보 가져오기
  const getChickEntriesByFarmSectionNo = async (farmSectionNo) => {
    const response = await chickEntryApi.getChickEntriesByFarmSectionNo(farmSectionNo);
    
    // 중복된 데이터 추가 방지 (기존에 있는 farmSectionNo와 같은 항목은 추가하지 않음)
    setChickEntry(prevEntries => {
      const newEntries = response.data.filter(entry => 
        !prevEntries.some(existingEntry => existingEntry.farmSectionNo === entry.farmSectionNo)
      );
      return [...prevEntries, ...newEntries];
    });
  }
  //농장동 번호로 도태폐기 정보 가져오기
  const getChickDeathByFarmSectionNo = async (farmSectionNo) => {
    const response = await chickDeathApi.getChickDeathByFarmSectionNo(farmSectionNo);
    
    // 중복된 데이터 추가 방지
    setChickDeath(prevDeaths => {
      const newDeaths = response.data.filter(death => 
        !prevDeaths.some(existingDeath => existingDeath.farmSectionNo === death.farmSectionNo)
      );
      return [...prevDeaths, ...newDeaths];
    });
  }
  

  useEffect(() => {

    // 1. 모든 데이터 가져오는 비동기 함수 선언
    const fetchAllData = async () => {
        try {
            setLoading(true);  // 로딩 시작

            /*** 1단계: Farm 가져오기 ***/
            const farmResponse = await farmApi.getFarmByUsersNo(usersNo);
            setFarm(farmResponse.data);

            /*** 2단계: FarmSection 가져오기 ***/
            const farmNo = farmResponse.data.farmNo;
            const sectionResponse = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
            setFarmSection(sectionResponse.data);

            /*** 3단계: Entry & Death 요청 미리 선언 (배열) ***/
            const entryPromises = sectionResponse.data.map(section =>
                chickEntryApi.getChickEntriesByFarmSectionNo(section.farmSectionNo)
            );

            const deathPromises = sectionResponse.data.map(section =>
                chickDeathApi.getChickDeathByFarmSectionNo(section.farmSectionNo)
            );

            /*** 4단계: Promise.all로 병렬 요청 ***/
            const entriesResults = await Promise.all(entryPromises);
            const deathsResults = await Promise.all(deathPromises);

            /*** 5단계: 요청 결과 펼쳐서 상태에 저장 ***/
            const allEntries = entriesResults.flatMap(response => response.data);
            const allDeaths = deathsResults.flatMap(response => response.data);

            setChickEntry(allEntries);
            setChickDeath(allDeaths);

        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false); // 로딩 끝
        }
    };

    /*** usersNo가 있으면 fetchAllData 실행 ***/
    if (usersNo) {
        fetchAllData();
    }

}, [usersNo]);  // useEffect는 usersNo가 바뀔 때만 실행


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
