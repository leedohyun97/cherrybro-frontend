import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersAuth } from "../util/authContext";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import { toast } from "react-toastify";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ChickEntryDetailPage() {
  //useNavigate 훅을 사용하여 페이지 이동
  const navigate = useNavigate();

  //사용자 인증 정보를 가져온다
  const { token, users } = useUsersAuth();

  //사용자 번호를 가져온다
  const usersNo = users?.usersNo || null;

  //농장 정보를 저장할 배열
  const [farm, setFarm] = useState([]);

  //농장 구역 정보를 저장할 배열
  const [farmSection, setFarmSection] = useState([]);

  //병아리 입고 정보를 저장할 배열
  const [chickEntry, setChickEntry] = useState([]);

  //필터링 시 선택한 농장 번호
  const [selectedFarmNo, setSelectedFarmNo] = useState(null);

  //필터링 시 선택한 농장 번호
  const [currentPage, setCurrentPage] = useState(0);

  //기본 페이지 사이즈
  const PAGE_SIZE = 10;

  const [loading, setLoading] = useState(true); // 로딩 상태를 저장할 변수

  const deleteAction = async (chickEntryNo) => {
    if (window.confirm("입추 내역을 삭제하시겠습니까?")) {
      try {
        await chickEntryApi.deleteChickEntry(chickEntryNo); // 병아리 입고 정보 삭제 API 호출
        toast.success("삭제되었습니다.");
        navigate("/admin-farm-section"); // 삭제 후 병아리 입고 목록 페이지로 이동
      } catch (error) {
        console.error("Error deleting chick entry:", error); // 에러를 콘솔에 출력한다
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    //선택 농장이 바뀌면 페이지는 1페이지로 초기화
    setCurrentPage(0);

    const fetchAllData = async () => {
      try {
        const [getAllFarm, getAllFarmSection, getAllChickEntry] =
          await Promise.all([
            farmApi.getAllFarm(token),
            farmSectionApi.getAllFarmSection(),
            selectedFarmNo !== null
              ? chickEntryApi.getChickEntriesByFarmNo(selectedFarmNo)
              : chickEntryApi.getAllChickEntries(),
          ]);

        const chickEntrySort = [...getAllChickEntry.data].sort(
          (a, b) =>
            new Date(b.chickEntryCreateAt) - new Date(a.chickEntryCreateAt)
        ); // 병아리 입추 정보를 등록 날짜 기준으로 내림차순 정렬

        setFarm(getAllFarm.data); // 농장 정보를 상태에 저장
        setFarmSection(getAllFarmSection.data); // 농장 구역 정보를 상태에 저장
        setChickEntry(chickEntrySort); // 병아리 입고 정보를 상태에 저장
      } catch (error) {
        console.error("Error fetching data:", error); // 에러를 콘솔에 출력한다
      } finally {
        setLoading(false); // 로딩 상태를 false로 변경
      }
    };
    fetchAllData();
  }, [token, selectedFarmNo]);

  const totalPage = Math.ceil(chickEntry.length / PAGE_SIZE);

  const paginatedRows = chickEntry.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleChangeNumber = (e) => {
    const value = e.target.value;
    setSelectedFarmNo(value ? Number(value) : null);
  };

  return (
    <div className="admin-page">
      <h2>전체 입추 내역</h2>

      {/* 농장 선택 필터 */}
      <div className="farm-filter" style={{ marginBottom: "1rem" }}>
        <label htmlFor="farm-select">농장 선택: </label>
        <select
          id="farm-select"
          value={selectedFarmNo}
          onChange={handleChangeNumber}
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

      <table className="admin-table">
        <thead>
          <tr>
            <th>농장</th>
            <th>동</th>
            <th>입추일</th>
            <th>입추 등록일</th>
            <th>입추 수</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {paginatedRows.map((entry) => {
            /* 1) 동 찾기: farmSection 배열에서 번호 일치하는 객체 찾기 */
            const findSection =
              farmSection.find(
                (section) => section.farmSectionNo === entry.farmSectionNo
              ) || {};
            /* 2) 농장 찾기: farms 배열에서 번호 일치하는 객체 찾기 */
            const findFarm =
              farm.find((farms) => farms.farmNo === findSection.farmNo) || {};
            return (
              <tr key={entry.chickEntryNo}>
                <td>{findFarm.farmName || "-"}</td>
                <td>{findSection.farmSectionName || "-"}</td>
                <td>{entry.chickEntryDate}</td>
                <td>
                  {entry.chickEntryCreateAt !== null
                    ? entry.chickEntryCreateAt.slice(0, 16).replace("T", " ")
                    : 0}
                </td>
                <td>{entry.chickEntryNumber?.toLocaleString()}</td>
                <td className="right">
                  <button
                    className="del-btn"
                    onClick={() => deleteAction(entry.chickEntryNo)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="icon" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
