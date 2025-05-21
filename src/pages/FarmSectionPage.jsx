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
  const { token, users } = useUsersAuth();//사용자 인증 정보를 가져온다
  const usersNo = users?.usersNo || null; //사용자 번호를 가져온다 (null이면 비로그인)
  /*————— Context 가져오기 END —————*/

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const [farm, setFarm] = useState({
    farmNo: "",
    farmName: "",
    usersNo: ""
  });  //농장 정보 빈 문자열로 초기화, 구조 설정 

  //농장동 데이터를 배열로 초기화(농장동 리스트)
  const [farmSection, setFarmSection] = useState([]);

  //농장동 번호를 키로 사용하여 Map으로 저장 예){1동 : 300, 2동 : 200}), chickEntry.get(1)으로 쉽게 꺼낼 수 있음
  const [chickEntry, setChickEntry] = useState(new Map());
  
  //총 입추 수는 숫자이기 때문에 0으로 초기화
  const [totalEntry, setTotalEntry] = useState(0);
  
  //농장동 번호를 키로 사용하여 Map으로 저장 예){1동 : 300, 2동 : 200}), chickDeath.get(1)으로 쉽게 꺼낼 수 있음
  const [chickDeath, setChickDeath] = useState(new Map());
  
  //총 도사 수는 숫자이기 때문에 0으로 초기화
  const [totalDeath, setTotalDeath] = useState(0);
  
  //농장동 번호를 키로 사용하여 Map으로 저장 예){1동 : 300, 2동 : 200}), chickDisposal.get(1)으로 쉽게 꺼낼 수 있음
  const [chickDisposal, setChickDisposal] = useState(new Map());
  
  //총 도사사 수는 숫자이기 때문에 0으로 초기화
  const [totalDisposal, setTotalDisposal] = useState(0);

  //로딩 상태, true면 로딩 상태 → 데이터 다 받으면 false로 바꿈.
  const [loading, setLoading] = useState(true);
  
  //입추 일자 List(배열)을 Map으로 저장, 일령 계산용, Map<farmSectionNo, Array<입추 내역>> 형태.
  const [chickEntryListMap, setChickEntryListMap] = useState(new Map());


  /* ───────────────────── rows 생성 ───────────────────── */
  /* farmSection(농장동) 기준으로 하나하나 순회하며 rows를 생성 */
  const rows = farmSection.map((section) => { //farmSection(배열)을 순회, 순회한 배열명은 section

    //순회한 배열의 farmSectionNo로 entry, death, disposal을 가져온다. farmSectionNo가 문자열이기 때문에 Number로 변환
    const entry = chickEntry.get(Number(section.farmSectionNo)) || 0;
    const death = chickDeath.get(Number(section.farmSectionNo)) || 0;
    const disposal = chickDisposal.get(Number(section.farmSectionNo)) || 0;


    /*—————————— 일령 계산 ——————————*/
    //입추일자 리스트에서 farmSectionNo에 해당하는 chickEntryList를 가져온다.
    /* 
    Map 형태로 farmSectionNo를 키로 사용하고, chickEntryList를 값으로 사용, 
    해당 farmSectionNo에 해당하는 chickEntryList를 가져온다.
    chickEntryListMap.get(1) 예시
    [
      { chickEntryDate: "2024-04-01", chickEntryNumber: 100 },
      { chickEntryDate: "2024-04-10", chickEntryNumber: 120 }
    ] 
    */
    const entries = chickEntryListMap.get(section.farmSectionNo) || [];

    //entries 배열에서 chickEntryDate를 Date 객체로 변환하여 대입, 최신 날짜로 내림차순 정렬
    const latestEntryDate = entries
      .map(e => new Date(e.chickEntryDate))
      .sort((a, b) => b - a)[0] || null;

    const today = new Date();//오늘 날짜와 시간
    today.setHours(0, 0, 0, 0);//시간은 전부 0으로 초기화, 날짜만 비교
    if (latestEntryDate) latestEntryDate.setHours(0, 0, 0, 0);//시간은 전부 0으로 초기화, 날짜만 비교

    //날짜 차이 계산
    const age = latestEntryDate ? Math.floor((today - latestEntryDate) / (1000 * 60 * 60 * 24)) + 1 : '';
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
  
  //토큰으로 농장 정보 가져오기
  const getMyFarm = async (token) => {
    const response = await farmApi.getMyFarm(token);
    setFarm(response.data);
  };
  
  //농장 번호로 농장동 정보 가져오기
  const getFarmSectionByFarmNo = async (farmNo) => {
    const response = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo);
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
  useEffect(() => { //페이지가 로드될 때 실행
    
    if (!token) {
      navigate("/main");  //토큰 없으면 메인으로 이동
      return;  //더 이상 실행 안 하고 종료
    }

    //모든 데이터 가져오는 비동기 함수 선언
    const fetchAllData = async () => {
        try {
          setLoading(true);  // 로딩 시작

          /*** 1. Farm 가져오기 ***/
          const farmResponse = await farmApi.getMyFarm(token);
          setFarm(farmResponse.data);

          /*** 2. FarmSection 가져오기 ***/
          const farmNo = farmResponse.data.farmNo; //farmNo 가져오기
          const sectionResponse = await farmSectionApi.getAllFarmSectionByFarmNo(farmNo); //farmSection 가져오기
          const sections = sectionResponse.data;//농장동 리스트 대입
          setFarmSection(sections);//농장동 리스트 저장

          /*** 3. 누적합 API 호출 (병렬로 실행) ***/
          const [entryArr, deathArr, dispArr] = await Promise.all([
            //Entry Api 호출
            Promise.all(sections.map(section => //농장동 목록 순회
              chickEntryApi.getTotalChickEntryNumberByFarmSectionNo(section.farmSectionNo) //농장동 번호로 입추 수 누적합 조회
                .then(res => { //요청이 끝나면 결과를 배열로 반환
                  return [Number(section.farmSectionNo), res.data || 0]; //농장동 번호와 입추수수 누적합을 배열로 반환
                })
            )),
            //Death Api 호출
            Promise.all(sections.map(section => //농장동 목록 순회
              chickDeathApi.getTotalChickDeathNumberByFarmSectionNo(section.farmSectionNo) //농장동 번호로 폐사 수 누적합 조회
                .then(res => [Number(section.farmSectionNo), res.data || 0]) //농장동 번호와 입추수수 누적합을 배열로 반환
            )),

            Promise.all(sections.map(section => //농장동 목록 순회
              chickDisposalApi.getTotalChickDisposalNumberByFarmSectionNo(section.farmSectionNo) //농장동 번호로 폐사 수 누적합 조회
                .then(res => [Number(section.farmSectionNo), res.data || 0]) //농장동 번호와 입추수수 누적합을 배열로 반환
            )),
          ]);

          /*** 4. 배열을 Map으로 변환 + 저장, get(1)로 접근 가능 ***/
          const entryMap = new Map(entryArr);
          const deathMap = new Map(deathArr);
          const disposalMap = new Map(dispArr);

          setChickEntry(entryMap);
          setChickDeath(deathMap);
          setChickDisposal(disposalMap);

          console.log('chickEntry map:', entryMap);
          console.log('chickDeath map:', deathMap);
          console.log('chickDisposal map:', disposalMap);

          /*** 5. 상단 카드용 총합 계산 ***/
          /*
          ...으로 배열로 만들고, values() 메서드를 사용하여 Map의 값만 추출, reduce() 메서드를 사용하여 총합 계산
          s는 누적합, v는 현재 값, 0부터 시작
          예시) entryMap.values() = [100, 200, 300]
          reduce((s, v) => s + v, 0) = 0 + 100 + 200 + 300 = 600
          */
          setTotalEntry([...entryMap.values()].reduce((s, v) => s + v, 0));
          setTotalDeath([...deathMap.values()].reduce((s, v) => s + v, 0));
          setTotalDisposal([...disposalMap.values()].reduce((s, v) => s + v, 0));

          /*** 6. 입추일자 리스트 (일령 계산용) 추가 ***/
          //모든 농장동을 순회하며 입추 일자 리스트를 API로 가져온다.
          const entryListPromises = sections.map(section =>
            chickEntryApi.getChickEntriesByFarmSectionNo(section.farmSectionNo)
               //농장동 번호, 입추일자 내역을 리스트로 반환
              .then(res => [Number(section.farmSectionNo), res.data])
          );
          //모든 동에 대한 입추 내역을 리스트로 반환
          const entryListArr = await Promise.all(entryListPromises);
          //배열을 Map으로 변환
          const entryListMap = new Map(entryListArr);
          setChickEntryListMap(entryListMap);

        } catch (error) {
          console.error("데이터 로딩 실패:", error);
        } finally {
          setLoading(false);  // 로딩 종료
        }
      };


    /*** usersNo가 있으면 fetchAllData 실행 ***/
    if (usersNo) {
        fetchAllData();
    }

}, [token]);  // useEffect는 usersNo가 바뀔 때만 실행


  /* ─── 집계 데이터 계산 ─────────────────── */
  const totalLive = totalEntry - totalDeath - totalDisposal; // 현재 마릿수 계산

  return (
    <div className="farm-page">
      {/* 데스크탑 카드 리스트 */}
      <section className="summary-wrap desktop-only">
        {[ 
          { label: '입추 수', value: totalEntry.toLocaleString() },
          { label: '누적 도사', value: totalDisposal.toLocaleString() },
          { label: '누적 폐사', value: totalDeath.toLocaleString() },
          { label: '사육수수', value: totalLive.toLocaleString() },
        ].map(c => (
          <div key={c.label} className="summary-card">
            <p className="card-label">{c.label}</p>
            <p className="card-value">{c.value}</p>
          </div>
        ))}
      </section>

      {/* 모바일 카드 리스트 */}
      <section className="card-list mobile-only">
        <div className="card-item">
          <span className="card-label">입추 수</span>
          <span className="card-value">{totalEntry.toLocaleString()}</span>
        </div>
        <div className="card-item">
          <span className="card-label">누적 도사</span>
          <span className="card-value">{totalDisposal.toLocaleString()}</span>
        </div>
        <div className="card-item">
          <span className="card-label">누적 폐사</span>
          <span className="card-value">{totalDeath.toLocaleString()}</span>
        </div>
        <div className="card-item">
          <span className="card-label">사육수수</span>
          <span className="card-value">{totalLive.toLocaleString()}</span>
        </div>
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
              <th>입추수수</th>
              <th>누적 도사</th>
              <th>누적 폐사</th>
              <th>사육수수</th>
              <th>육성율</th>
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
                <td>{r.entry ? (((r.entry - r.death - r.disposal) / r.entry) * 100).toFixed(2) + '%' : '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
