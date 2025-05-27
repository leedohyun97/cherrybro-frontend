import React, { useEffect, useState } from "react";
import "../styles/farmSectionPage.css";
import * as usersApi from "../api/usersApi";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from "react-router-dom";

export default function AdminFarmSectionPage() {
  /*————— Context 가져오기 START —————*/
  const { token, users } = useUsersAuth(); // 사용자 인증 정보를 가져온다
  const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
  const usersRole = users?.usersRole || null; //사용자 번호를 가져온다
  /*————— Context 가져오기 END —————*/

  /* ───────────────────── 데이터 선언 ───────────────────── */
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  //농장 데이터를 배열로 초기화
  const [farm, setFarm] = useState([]);

  //농장동 데이터를 배열로 초기화
  const [farmSection, setFarmSection] = useState([]);

  //현재 보고 있는 페이지 번호, 몇 번째 페이지를 보여줄지를 이 값으로 제어
  const [currentPage, setCurrentPage] = useState(0);

  //입추 수 데이터를 배열로 초기화
  const [chickEntry, setChickEntry] = useState([]);

  //페사 수 데이터를 배열로 초기화
  const [chickDeath, setChickDeath] = useState([]);

  //도사 수 데이터를 배열로 초기화
  const [chickDisposal, setChickDisposal] = useState([]);

  //상단 카드용 집계 데이터
  const [totalEntry, setTotalEntry] = useState(0);

  //상단 카드용 집계 데이터
  const [totalDeath, setTotalDeath] = useState(0);

  //상단 카드용 집계 데이터
  const [totalDisposal, setTotalDisposal] = useState(0);

  //상단 카드용 집계 데이터
  const [totalLive, setTotalLive] = useState(0);

  //로딩 상태
  const [loading, setLoading] = useState(true);

  // 선택된 농장번호(필터링)
  const [selectedFarmNo, setSelectedFarmNo] = useState("");

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
    list.forEach((item) => {
      //리스트 안에 항목들을 반복해서 처리
      const key = item[sectionKey]; //항목에서 sectionKey에 해당하는 값을 가져온다
      const value = item[valueKey]; //항목에서 valueKey에 해당하는 값을 가져온다
      result.set(
        key,
        (result.get(key) || 0) + value
      ); /* result에 key가 없으면 0을 넣고, 있으면 기존 값에 value를 더한다
      현재 result.get(1)에는 값이 없으므로 0 + value(예(100))을 더함, 즉 1, 100이 들어감 */
    });
    return result;
  };

  const calculateSummary = (
    farmSection,
    chickEntry,
    chickDeath,
    chickDisposal,
    selectedFarmNo
  ) => {
    const filteredSections = selectedFarmNo
      ? farmSection.filter((fs) => fs.farmNo === Number(selectedFarmNo))
      : farmSection;

    const sectionNoSet = new Set(
      filteredSections.map((fs) => fs.farmSectionNo)
    );

    const filteredEntry = chickEntry.filter((e) =>
      sectionNoSet.has(e.farmSectionNo)
    );
    const filteredDeath = chickDeath.filter((d) =>
      sectionNoSet.has(d.farmSectionNo)
    );
    const filteredDisposal = chickDisposal.filter((d) =>
      sectionNoSet.has(d.farmSectionNo)
    );

    const entrySum = filteredEntry.reduce(
      (sum, e) => sum + e.chickEntryNumber,
      0
    );
    const deathSum = filteredDeath.reduce(
      (sum, d) => sum + d.chickDeathNumber,
      0
    );
    const disposalSum = filteredDisposal.reduce(
      (sum, d) => sum + d.chickDisposalNumber,
      0
    );

    return {
      totalEntry: entrySum,
      totalDeath: deathSum,
      totalDisposal: disposalSum,
      totalLive: entrySum - deathSum - disposalSum,
    };
  };

  //토큰이 들어오거나, 번호를 선택했을 때 실행
  useEffect(() => {
    //토큰이 없으면 메인으로 이동
    if (!token) {
      navigate("/main");
      return;
    }

    //선택 농장이 바뀌면 페이지는 1페이지로 초기화
    setCurrentPage(0);

    //데이터를 가져옴
    const fetchAllData = async () => {
      try {
        setLoading(true);

        //모든 농장 데이터 가져오기
        const farmResponse = await farmApi.getAllFarm(token);
        setFarm(farmResponse.data);

        //농장 선택 시에는 선택한 농장동만 가져오기, 아닐 시 모든 농장동 데이터 가져오기
        const farmSectionResponse = selectedFarmNo
          ? await farmSectionApi.getAllFarmSectionByFarmNo(selectedFarmNo)
          : await farmSectionApi.getAllFarmSection();
        setFarmSection(farmSectionResponse.data);

        //모든 입추 내역 가져오기
        const entryResult = await chickEntryApi.getAllChickEntries();
        setChickEntry(entryResult.data);

        //모든 폐사 내역 가져오기
        const deathResult = await chickDeathApi.getAllChickDeath();
        setChickDeath(deathResult.data);

        //모든 도사 내역 가져오기
        const disposalResult = await chickDisposalApi.getAllChickDisposal();
        setChickDisposal(disposalResult.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    //데이터 가져오기
    fetchAllData();
  }, [token, selectedFarmNo]); // token, selectedFarmNo 감지

  useEffect(() => {
    const { totalEntry, totalDeath, totalDisposal, totalLive } =
      calculateSummary(
        farmSection,
        chickEntry,
        chickDeath,
        chickDisposal,
        selectedFarmNo
      );

    setTotalEntry(totalEntry);
    setTotalDeath(totalDeath);
    setTotalDisposal(totalDisposal);
    setTotalLive(totalLive);
    setCurrentPage(0); // 필터 바뀌면 페이지 초기화
  }, [selectedFarmNo, farmSection, chickEntry, chickDeath, chickDisposal]);

  /* ─── 농장동별 데이터 계산 ─────────────────── */
  //입추 내역에서 farmSectionNo 별로 chickEntryNumber 가져와 Map형태로 저장(키, 밸류)
  const entryMap = TotalMap(chickEntry, "farmSectionNo", "chickEntryNumber");
  const deathMap = TotalMap(chickDeath, "farmSectionNo", "chickDeathNumber");
  const disposalMap = TotalMap(
    chickDisposal,
    "farmSectionNo",
    "chickDisposalNumber"
  );
  /* ─── 농장동별 데이터 계산 ─────────────────── */

  /* ───────────────────── rows 생성 ───────────────────── */
  //farmSection(농장동) 기준으로 rows를 생성
  const rows = farmSection
    .map((section) => {
      //map에서 key값을 통해 value를 가져옴
      const entry = entryMap.get(section.farmSectionNo) || 0; //입추 수
      const death = deathMap.get(section.farmSectionNo) || 0; //도태 폐사 수
      const disposal = disposalMap.get(section.farmSectionNo) || 0; //도태 수

      /*—————————— 일령 계산 Start ——————————*/
      //입추 날짜 (시간 제거)
      const entries = chickEntry.filter(
        (e) => e.farmSectionNo === section.farmSectionNo
      );
      const lastEntryDate =
        entries
          .map((e) => new Date(e.chickEntryDate))
          .sort((a, b) => b - a)[0] || null;

      //오늘 날짜 (시간 제거)
      const today = new Date();
      today.setHours(0, 0, 0, 0); //시간을 00:00:00으로 맞춤
      if (lastEntryDate) lastEntryDate.setHours(0, 0, 0, 0);

      //일령 계산
      const age = lastEntryDate
        ? Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24)) + 1
        : null;
      /*—————————— 일령 계산 End ——————————*/

      //현재 농장동(section)의 farmNo와 전체 농장 리스트(farm) 중 farmNo가 같은 해당 농장 객체를 찾아 반환
      const farmInfo = farm.find((f) => f.farmNo === section.farmNo);

      //row 데이터 반환 (항상 farmSection 기준으로 출력)
      return {
        farmNo: section.farmNo,
        farmSectionNo: section.farmSectionNo, // 농장동 번호
        farmName: farmInfo ? farmInfo.farmName : "농장 없음", // 농장 이름 매칭
        farmSectionName: section.farmSectionName || "", // 농장동 이름
        lastEntry: lastEntryDate
          ? lastEntryDate.toISOString().slice(0, 10)
          : "", // 최근 입추일 (없으면 빈값)
        entry: entry, //입추 수
        death: death, //폐사 수
        disposal: disposal, // 도사 수
        live: entry - death - disposal, // 현재 마릿수
        age: age || "", // 일령 (없으면 null)
      };
    }) // rows 배열을 정렬한다
    .sort((a, b) => {
      /*————— 농장 이름을 한글 사전 순서로 정렬 start —————*/
      //한글을 기준으로 문자 비교(-1 : a.farmName이 먼저, 0 : 같다, 1 : b.farmName이 먼저)
      const nameCompare = a.farmName.localeCompare(b.farmName, "ko");
      //농장 이름이 서로 다르면 비교 결과를 저장해 정렬 순서 결정
      if (nameCompare !== 0) return nameCompare;
      /*————— 농장 이름을 한글 사전 순서로 정렬 end —————*/

      /*————— 농장 이름이 같을 경우 → 농장동 이름에서 숫자 추출해서 비교 —————*/
      // farmSectionName(예: '1동', '2동')에서 숫자만 추출하는 함수
      const getNumber = (name) =>
        parseInt(
          // 문자열을 숫자로 바꿈
          name.replace(/[^0-9]/g, ""), // 숫자가 아닌 모든 문자 제거 (예: '강남1동' → '1')
          10 // 10진수
        ) || 0; // 숫자 없으면 0 반환

      // 숫자 비교 → 숫자가 작은 동이 앞으로
      return getNumber(a.farmSectionName) - getNumber(b.farmSectionName);
    });

  //총 페이지 계산, rows.length: 전체 항목 수, PAGE_SIZE: 보여줄 항목 수, Math.ceil(올림)
  const totalPage = Math.ceil(rows.length / PAGE_SIZE);

  //전체 농장동 데이터 배열(ROW)에서 시작(0)부터 끝-1(10-1 => 9)까지 잘라서 새 배열 제작
  const paginatedRows = rows.slice(
    //현재 페이지 번호(currentPage(0)) * 보여줄 항목 수(PAGE_SIZE(10)) => r[0]
    currentPage * PAGE_SIZE,
    //현재 페이지 번호(currentPage(0+1))* 보여줄 항목 수(PAGE_SIZE(10)) => r[10]
    (currentPage + 1) * PAGE_SIZE
  );

  const handleClick = (farmSectionNo) => {
    navigate(`/chick-detail/${farmSectionNo}`);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="farm-page">
      {/* 농장 선택 필터 */}
      <div className="farm-filter" style={{ marginBottom: "1rem" }}>
        <label htmlFor="farm-select">농장 선택: </label>
        <select
          id="farm-select"
          value={selectedFarmNo}
          onChange={(e) => setSelectedFarmNo(e.target.value)}
        >
          <option value="">전체 보기</option>
          {/* 농장 배열의 이름 전체 출력, key=농장번호 value=농장번호 */}
          {farm.map((f) => (
            <option key={f.farmNo} value={f.farmNo}>
              {f.farmName}
            </option>
          ))}
        </select>
      </div>

      {/* ─── 상단 카드 4개 ─────────────────── */}
      <section className="summary-wrap">
        {[
          { label: "입추 수", value: totalEntry.toLocaleString() },
          { label: "누적 도사", value: totalDisposal.toLocaleString() },
          { label: "누적 폐사", value: totalDeath.toLocaleString() },
          { label: "현재 마릿수", value: totalLive.toLocaleString() },
        ].map((c) => (
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
              <th>입추일</th>
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
              <tr
                key={index}
                onClick={() => handleClick(r.farmSectionNo)} // 농장동 번호 클릭 시 상세 페이지로 이동)}
              >
                <td>{r.farmName || "농장 없음"}</td>
                <td>{r.farmSectionName || "동 없음"}</td>
                <td>{r.lastEntry || "없음"}</td>
                <td>{`${r.age}일령`}</td>
                <td>
                  {r.entry !== undefined ? r.entry.toLocaleString() : "0"}
                </td>
                <td>
                  {r.disposal !== undefined ? r.disposal.toLocaleString() : "0"}
                </td>
                <td>
                  {r.death !== undefined ? r.death.toLocaleString() : "0"}
                </td>
                <td>{r.live !== undefined ? r.live.toLocaleString() : "0"}</td>
                <td>
                  {r.entry
                    ? (
                        ((r.entry - r.death - r.disposal) / r.entry) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
                </td>
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
              className={page === currentPage ? "active-page" : ""}
            >
              {page + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
