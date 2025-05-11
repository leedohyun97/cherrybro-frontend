import React, { useEffect, useState } from 'react';
import '../styles/farmSectionPage.css';
import * as usersApi from "../api/usersApi";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from 'react-router-dom';

export default function FarmSectionPage() {
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  /*————— Context 가져오기 START —————*/
  const { token, users } = useUsersAuth();// 사용자 인증 정보를 가져온다
  const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
  /*————— Context 가져오기 END —————*/

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const [farm, setFarm] = useState({
    farmNo: "",
    farmName: "",
    usersNo: ""
  });

  //농장동 데이터를 배열로 초기화
  const [farmSection, setFarmSection] = useState([]);

  //입추 수 데이터
  const [chickEntry, setChickEntry] = useState(new Map());

  const [totalEntry, setTotalEntry] = useState(0);

  //폐사 수 데이터
  const [chickDeath, setChickDeath] = useState(new Map());

  const [totalDeath, setTotalDeath] = useState(0);

  //도사 수 데이터
  const [chickDisposal, setChickDisposal] = useState(new Map());
  const [totalDisposal, setTotalDisposal] = useState(0);

  //로딩 상태
  const [loading, setLoading] = useState(true);
  
  const [chickEntryListMap, setChickEntryListMap] = useState(new Map());


  /* ───────────────────── rows 생성 ───────────────────── */
//farmSection(농장동) 기준으로 rows를 생성\
const rows = farmSection.map((section) => {

  const entry = chickEntry.get(Number(section.farmSectionNo)) || 0;
  const death = chickDeath.get(Number(section.farmSectionNo)) || 0;
  const disposal = chickDisposal.get(Number(section.farmSectionNo)) || 0;


  /*—————————— 일령 계산 ——————————*/
  const entries = chickEntryListMap.get(section.farmSectionNo) || [];
  const latestEntryDate = entries
    .map(e => new Date(e.chickEntryDate))
    .sort((a, b) => b - a)[0] || null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (latestEntryDate) latestEntryDate.setHours(0, 0, 0, 0);

  const age = latestEntryDate ? Math.floor((today - latestEntryDate) / 86400000) + 1 : '';
    /*—————————— 일령 계산 ——————————*/

  //row 데이터 반환 (항상 farmSection 기준으로 출력)
  return {
      farmSectionNo: section.farmSectionNo,  // 농장동 번호
      farmName: farm.farmName || '',         // 농장 이름 (없으면 빈값)
      farmSectionName: section.farmSectionName || '',  // 농장동 이름
      lastEntry: latestEntryDate ? latestEntryDate.toISOString().slice(0, 10) : '',  // 최근 입추일 (없으면 빈값)
      entry : entry,                     // 입추 수
      death : death,                     // 폐사 수               
      disposal : disposal,              // 도사 수
      live: entry - death - disposal,        // 현재 마릿수
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
  //농장동 번호로 폐사 정보 가져오기
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
  
  //농장동 번호로 도사 정보 가져오기
  const getChickDisposalByFarmSectionNo = async (farmSectionNo) => {
    const response = await chickDisposalApi.getChickDisposalByFarmSectionNo(farmSectionNo);
    
    // 중복된 데이터 추가 방지
    setChickDisposal(prevDisposals => {
      const newDisposals = response.data.filter(disposal => 
        !prevDisposals.some(existingDisposal => existingDisposal.farmSectionNo === disposal.farmSectionNo)
      );
      return [...prevDisposals, ...newDisposals];
    });
  }
  
  /* ───────────────────── 함수 선언 ───────────────────── */
  useEffect(() => {
    
    if (!token) {
      navigate("/main");  //큰 없으면 이동
      return;  //더 이상 실행 안 하고 종료
    }

    //모든 데이터 가져오는 비동기 함수 선언
    const fetchAllData = async () => {
        try {
            setLoading(true);  // 로딩 시작
            
            /*** Farm 가져오기 ***/
            const farmResponse = await farmApi.getFarmByUsersNo(usersNo);
            setFarm(farmResponse.data);

            /*** FarmSection 가져오기 ***/
            const farmNo = farmResponse.data.farmNo;
            const sectionResponse = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
            setFarmSection(sectionResponse.data); //농장동 데이터 업데이트, ROW 계산용
            const sections = sectionResponse.data; //가독성을 위한 농장동 데이터 저장

            /*** Entry, Death, Disposal 요청 미리 선언 (배열) ***/
            const entryPromises = sectionResponse.data.map(section =>
                chickEntryApi.getTotalChickEntryNumberByFarmSectionNo(section.farmSectionNo)
                .then(response => {
                  console.log('📦 입추 API 응답:', section.farmSectionNo, response.data.data);
                  return [section.farmSectionNo, response.data.data || 0];
                }))

            const deathPromises = sectionResponse.data.map(section =>
                chickDeathApi.getTotalChickDeathNumberByFarmSectionNo(section.farmSectionNo)
                .then(response => [section.farmSectionNo, response.data.data || 0]) //농장동 번호와 폐사 수를 함께 저장
            );

            const disposalPromises = sectionResponse.data.map(section =>
                chickDisposalApi.getTotalChickDisposalNumberByFarmSectionNo(section.farmSectionNo)
                .then(response => [section.farmSectionNo, response.data.data || 0]) //농장동 번호와 도사 수를 함께 저장
            );

            /*** Promise.all로 병렬 요청 ***/
            const [entryArr, deathArr, dispArr] = await Promise.all([
              Promise.all(entryPromises),
              Promise.all(deathPromises),
              Promise.all(disposalPromises)
            ]);
            /*** Map으로 변환 ***/
            const entryMap = new Map(entryArr.map(([k, v]) => [Number(k), v]));
            const deathMap = new Map(deathArr.map(([k, v]) => [Number(k), v]));
            const disposalMap = new Map(dispArr.map(([k, v]) => [Number(k), v]));


            setChickEntry(entryMap); // 입추 수 데이터 설정
            setChickDeath(deathMap); // 폐사 수 데이터 설정
            setChickDisposal(disposalMap); // 도사 수 데이터 설정
            
            console.log('✅ chickEntry map:', entryMap);
            console.log('✅ chickDeath map:', deathMap);
            console.log('✅ chickDisposal map:', disposalMap);

            /*** 상단카드용 전체 합계 계산 ***/
            setTotalEntry([...entryMap.values()].reduce((s, v) => s + v, 0));
            setTotalDeath([...deathMap.values()].reduce((s, v) => s + v, 0));
            setTotalDisposal([...disposalMap.values()].reduce((s, v) => s + v, 0));
            
            const entryListPromises = sections.map(section =>
              chickEntryApi.getChickEntriesByFarmSectionNo(section.farmSectionNo)
                .then(res => [section.farmSectionNo, res.data])
            );
            
            const entryListArr = await Promise.all(entryListPromises);
            const entryListMap = new Map(entryListArr);
            setChickEntryListMap(entryListMap);
            
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
  const totalLive = totalEntry - totalDeath - totalDisposal; // 현재 마릿수 계산

  return (
    <div className="farm-page">
      {/* ─── 상단 카드 3개 ─────────────────── */}
      <section className="summary-wrap">
        {[ 
          { label: '입추 수', value: totalEntry.toLocaleString() },
          { label: '누적 도사', value: totalDisposal.toLocaleString() },
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
              <th>누적 도사</th>
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
                <td>{Number.isFinite(r.entry) ? r.entry.toLocaleString() : '0'}</td>
                <td>{Number.isFinite(r.disposal) ? r.disposal.toLocaleString() : '0'}</td>
                <td>{Number.isFinite(r.death) ? r.death.toLocaleString() : '0'}</td>
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
