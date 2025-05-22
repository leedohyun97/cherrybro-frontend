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

  const [currentPage, setCurrentPage] = useState(0);

  //입추 수 데이터를 배열로 초기화
  const [chickEntry, setChickEntry] = useState([]);

  //페사 수 데이터를 배열로 초기화
  const [chickDeath, setChickDeath] = useState([]);

  //도사 수 데이터를 배열로 초기화
  const [chickDisposal, setChickDisposal] = useState([]);

  //로딩 상태
  const [loading, setLoading] = useState(true);

  // 선택된 농장번호(필터링)
  const [selectedFarmNo, setSelectedFarmNo] = useState(''); 

  //현재 선택된 농장이 있는지 확인 (필터링 중인지 여부)
  const isFiltering = selectedFarmNo !== "";
  
  //기본 페이지 사이즈
  const PAGE_SIZE = 10;

  /* 
  TotalMap 함수 설명
    list : 입추, 폐사, 도사 배열
    sectionKey : 묶을 기준 키 (농장동 번호)
    valueKey : 합계를 구할 키 (입추, 폐사, 도사 수)
    result : 농장동 번호를 키로 하고, 해당 농장동의 입추, 폐사, 도사 수의 합계를 값으로 하는 Map 객체
    예시)
    list = [
      { farmSectionNo: 1, chickEntryNumber: 10 },
      { farmSectionNo: 1, chickEntryNumber: 5 },
      { farmSectionNo: 2, chickEntryNumber: 8 },
    ]
    sectionKey = 'farmSectionNo'
    valueKey = 'chickEntryNumber'
    result = {
      1: 15,
      2: 8
    }
  */
  const TotalMap = (list, sectionKey, valueKey) => {
    const result = new Map();
    list.forEach(item => { //리스트 안에 항목들을 반복해서 처리
      const key = item[sectionKey]; //항목에서 sectionKey에 해당하는 값을 가져온다
      const value = item[valueKey]; //항목에서 valueKey에 해당하는 값을 가져온다
      result.set(key, (result.get(key) || 0) + value); /* result에 key가 없으면 0을 넣고, 있으면 기존 값에 value를 더한다
      현재 result.get(1)에는 값이 없으므로 0 + value(예(100))을 더함, 즉 1, 100이 들어감 */
    });
    return result;
  };

  
  const fetchFarmSections = async () => {
    // selectedFarmNo 가 있으면 그 농장만, 없으면 전체
    return selectedFarmNo
      ? farmSectionApi.getAllFarmSectionByFarmNo(selectedFarmNo)
      : farmSectionApi.getAllFarmSection();
  };

  
useEffect(() => {
  if (!token) {
    navigate("/main");
    return;
  }

  //선택 농장이 바뀌면 페이지는 1페이지로 초기화
  setCurrentPage(0);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const farmResponse = await farmApi.getAllFarm(token);
      setFarm(farmResponse.data);

      const farmSectionResponse = selectedFarmNo ? await farmSectionApi.getAllFarmSectionByFarmNo(selectedFarmNo) : await farmSectionApi.getAllFarmSection()
      setFarmSection(farmSectionResponse.data);

      const entryResult = await chickEntryApi.getAllChickEntries();
      setChickEntry(entryResult.data);

      const deathResult = await chickDeathApi.getAllChickDeath();
      setChickDeath(deathResult.data);

      const disposalResult = await chickDisposalApi.getAllChickDisposal();
      setChickDisposal(disposalResult.data);

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, [token, selectedFarmNo]); // selectedFarmNo도 감지

    
    /* ─── 농장동별 데이터 계산 ─────────────────── */
    const entryMap = TotalMap(chickEntry, 'farmSectionNo', 'chickEntryNumber');
    const deathMap = TotalMap(chickDeath, 'farmSectionNo', 'chickDeathNumber');
    const disposalMap = TotalMap(chickDisposal, 'farmSectionNo', 'chickDisposalNumber');
    
    
    /* ─── 집계 데이터 계산 ─────────────────── */
    const totalEntry = [...entryMap.values()].reduce((sum, v) => sum + v, 0);
    const totalDeath = [...deathMap.values()].reduce((sum, v) => sum + v, 0);
    const totalDisposal = [...disposalMap.values()].reduce((sum, v) => sum + v, 0);
    const totalLive = totalEntry - totalDeath - totalDisposal;

    /* ───────────────────── rows 생성 ───────────────────── */
    //farmSection(농장동) 기준으로 rows를 생성
    const rows = farmSection.map((section) => {
  
      const entry = entryMap.get(section.farmSectionNo) || 0; //입추 수
      const death = deathMap.get(section.farmSectionNo) || 0; //도태 폐사 수
      const disposal = disposalMap.get(section.farmSectionNo) || 0; //도태 수
  
      /*—————————— 일령 계산 ——————————*/
      // 입추 날짜 (시간 제거)
      const entries = chickEntry.filter(e => e.farmSectionNo === section.farmSectionNo);
      const lastEntryDate = entries.map(e => new Date(e.chickEntryDate)).sort((a, b) => b - a)[0] || null;

      //오늘 날짜 (시간 제거)
      const today = new Date(); 
      today.setHours(0, 0, 0, 0);  //시간을 00:00:00으로 맞춤
      if (lastEntryDate) lastEntryDate.setHours(0, 0, 0, 0);
  
      // 일령 계산
      const age = lastEntryDate ? Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24)) + 1 : null;


      /*—————————— 일령 계산 ——————————*/
  
      //farmSection의 farmNo로 farmName 찾아오기
      const farmInfo = farm.find(f => f.farmNo === section.farmNo);
  
      //row 데이터 반환 (항상 farmSection 기준으로 출력)
      return {
          farmNo: section.farmNo,
          farmSectionNo: section.farmSectionNo,  // 농장동 번호
          farmName: farmInfo ? farmInfo.farmName : '농장 없음', // 농장 이름 매칭
          farmSectionName: section.farmSectionName || '',  // 농장동 이름
          lastEntry: lastEntryDate ? lastEntryDate.toISOString().slice(0, 10) : '',  // 최근 입추일 (없으면 빈값)
          entry: entry,                     //입추 수
          death: death,                     //폐사 수
          disposal: disposal,               // 도사 수
          live: entry - death - disposal,  // 현재 마릿수
          age: age || ''                    // 일령 (없으면 null)
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

    const totalPage = Math.ceil(rows.length / PAGE_SIZE);

    const paginatedRows = rows.slice(
      currentPage * PAGE_SIZE,
      (currentPage + 1) * PAGE_SIZE
    );


    return (
      <div className="farm-page">

      {/* 농장 선택 필터 */}
      <div className="farm-filter" style={{ marginBottom: '1rem' }}>
        <label htmlFor="farm-select">농장 선택: </label>
        <select
          id="farm-select"
          value={selectedFarmNo}
          onChange={(e) => setSelectedFarmNo(e.target.value)}
        >
          <option value="">전체 보기</option>
          {farm.map(f => (
            <option key={f.farmNo} value={f.farmNo}>
              {f.farmName}
            </option>
          ))}
        </select>
      </div>

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
              <th>육성율</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((r, index) => (
              <tr key={index}>
                <td>{r.farmName || '농장 없음'}</td>
                <td>{r.farmSectionName || '동 없음'}</td>
                <td>{r.lastEntry || '없음'}</td>
                <td>{`${r.age}일령`}</td>
                <td>{r.entry !== undefined ? r.entry.toLocaleString() : '0'}</td>
                <td>{r.disposal !== undefined ? r.disposal.toLocaleString() : '0'}</td>
                <td>{r.death !== undefined ? r.death.toLocaleString() : '0'}</td>
                <td>{r.live !== undefined ? r.live.toLocaleString() : '0'}</td>
                <td>{r.entry ? (((r.entry - r.death - r.disposal) / r.entry) * 100).toFixed(2) + '%' : '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPage > 1 && (
      <div className="pagination">
        {[...Array(totalPage)].map((_, page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? 'active-page' : ''}
          >
            {page + 1}
          </button>
        ))}
      </div>
    )}


    </div>
  );
}
