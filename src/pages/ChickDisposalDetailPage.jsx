import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersAuth } from "../util/authContext";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

export default function ChickDisposalDetailPage() {
  // useNavigate 훅을 사용하여 페이지 이동
  const navigate = useNavigate();

  // 사용자 인증 정보를 가져온다
  const { token, users } = useUsersAuth();

  //사용자 번호를 가져온다
  const usersNo = users?.usersNo || null;

  // 농장 정보를 저장할 배열
  const [farm, setFarm] = useState(null);

  // 농장 구역 정보를 저장할 배열
  const [farmSections, setFarmSections] = useState([]);

  // 병아리 입고 정보를 저장할 배열
  const [chickDisposals, setChickDisposals] = useState([]);

  //필터링 시 선택한 농장동 번호
  const [selectedFarmSectionNo, setSelectedFarmSectionNo] = useState(null);

  //필터링 시 선택한 농장 번호
  const [currentPage, setCurrentPage] = useState(0);

  //기본 페이지 사이즈
  const PAGE_SIZE = 10;

  // 로딩 상태를 저장할 변수
  const [loading, setLoading] = useState(true);

  const deleteAction = async (chickDisposalNo) => {
    if (window.confirm("도사 내역을 삭제하시겠습니까?")) {
      try {
        await chickDisposalApi.deleteChickDisposal(chickDisposalNo); // 병아리 입고 정보 삭제 API 호출
        toast.success("삭제되었습니다.");
        navigate("/farm-section"); // 삭제 후 병아리 입고 목록 페이지로 이동
      } catch (error) {
        console.error("Error deleting chick entry:", error); // 에러를 콘솔에 출력한다
      }
    }
  };

  useEffect(() => {
    if (!usersNo) return; // usersNo가 아직 준비 안 됐으면 실행 안 함

    setCurrentPage(0); // 선택 농장이 바뀌면 페이지는 1페이지로 초기화

    const fetchAllData = async () => {
      try {
        const getMyFarm = await farmApi.getMyFarm(token); // 사용자 번호로 농장 정보 조회
        const getMyFarmData = getMyFarm.data; // 농장 정보
        setFarm(getMyFarmData); // 농장 정보를 상태에 저장

        const getAllFarmSectionByFarmNo =
          await farmSectionApi.getAllFarmSectionByFarmNo(getMyFarmData.farmNo); // 농장 번호로 농장 구역 정보 조회
        const getAllFarmSectionByFarmNoData = getAllFarmSectionByFarmNo.data; // 농장 구역 정보
        setFarmSections(getAllFarmSectionByFarmNoData); // 농장 구역 정보를 상태에 저장

        const selectedFarmSection = selectedFarmSectionNo
          ? [selectedFarmSectionNo]
          : getAllFarmSectionByFarmNoData.map((s) => s.farmSectionNo);

        const chickDisposalResponse = selectedFarmSection.map(
          (sectionNo) =>
            chickDisposalApi
              .getChickDisposalByFarmSectionNo(sectionNo)
              .then((response) => response.data) // 농장 구역 번호로 병아리 도사사 정보 조회
        );

        const chickDisposalResult = await Promise.all(chickDisposalResponse); // 모든 API 호출이 완료될 때까지 대기
        console.log("chickDisposalResult", chickDisposalResult);
        const chickDisposalFlattened = chickDisposalResult.flat(); // 중첩된 배열을 평탄화
        console.log("chickDisposalFlattened", chickDisposalFlattened);
        const chickDisposalSort = chickDisposalFlattened.sort(
          (a, b) =>
            new Date(b.chickDisposalCreateAt) -
            new Date(a.chickDisposalCreateAt)
        ); // 병아리 정보를 등록 날짜 기준으로 내림차순 정렬
        console.log("chickDisposalSort", chickDisposalSort);

        setChickDisposals(chickDisposalSort); // 병아리 입고 정보를 상태에 저장
      } catch (error) {
        console.error("Error fetching data:", error); // 에러를 콘솔에 출력한다
      } finally {
        setLoading(false); // 로딩 상태를 false로 변경
      }
    };

    fetchAllData();
  }, [token, selectedFarmSectionNo]);

  //번호 선택 시 change
  const handleChangeFarmSectionNo = (e) => {
    const value = e.target.value;
    setSelectedFarmSectionNo(value);
  };

  const totalPage = Math.ceil(chickDisposals.length / PAGE_SIZE);

  const paginatedRows = chickDisposals.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  return (
    <div className="admin-page">
      <h2>전체 도사 내역</h2>

      {/* 농장동 선택 필터 */}
      <div className="farm-filter">
        <label htmlFor="farm-select">농장동 선택 : </label>
        <select
          id="farm-select"
          value={selectedFarmSectionNo}
          onChange={handleChangeFarmSectionNo}
        >
          <option value={""}>전체 보기</option>
          {farmSections.map((f) => (
            <option key={f.farmSectionNo} value={f.farmSectionNo}>
              {f.farmSectionName}
            </option>
          ))}
          ;
        </select>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>농장</th>
            <th>동</th>
            <th>도사일</th>
            <th>도사 등록일</th>
            <th>도사 수</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {paginatedRows.map((disposal) => {
            /* 1) 동 찾기: farmSection 배열에서 번호 일치하는 객체 찾기 */
            const findSection =
              farmSections.find(
                (section) => section.farmSectionNo === disposal.farmSectionNo
              ) || {};

            return (
              <tr key={disposal.chickDisposalNo}>
                <td>{farm.farmName || "-"}</td>
                <td>{findSection.farmSectionName || "-"}</td>
                <td>{disposal.chickDisposalDate}</td>
                <td>
                  {disposal.chickDisposalCreateAt !== null
                    ? disposal.chickDisposalCreateAt
                        .slice(0, 16)
                        .replace("T", " ")
                    : 0}
                </td>
                <td>{disposal.chickDisposalNumber?.toLocaleString()}</td>
                <td className="right">
                  <button
                    className="del-btn"
                    onClick={() => deleteAction(disposal.chickDisposalNo)}
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
