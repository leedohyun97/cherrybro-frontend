import React, { useEffect, useState } from "react";
import "../styles/ChickDeathDisposalPage.css";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as responseStatus from "../api/responseStatusCode";
import { useUsersAuth } from "../util/authContext";
import { useNavigate } from "react-router-dom";

/* 도태/폐사 입력 페이지 */
export default function ChickReducePage() {
  /* 사용자 정보 선언  */
  const { token, users } = useUsersAuth();
  const usersNo = users?.usersNo || null;
  /* 훅 선언  */
  const navigate = useNavigate();

  /*───── 상태 선언 Start─────*/
  const [farm, setFarm] = useState({ farmNo: "", farmName: "", userNo: "" }); //농장
  const [farmSectionList, setFarmSectionList] = useState([]); //농장동 리스트(배열)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, 오늘 날짜(기본값)

  /* 도태/폐사 입력 선언 */
  const [input, setInput] = useState({
    farmSectionNo: "",
    date: today,
    chickDisposalNumber: "",
    chickDeathNumber: "",
  });

  //도태/폐사 입력 추적
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  //농장동 입력 추적
  const selectSection = (sectionNo) => {
    setInput((prev) => ({ ...prev, farmSectionNo: sectionNo }));
  };

  //농장 데이터 불러오기
  const fetchData = async () => {
    try {
      //토큰으로 본인 농장 데이터 가져오기
      const farmRes = await farmApi.getMyFarm(token);
      setFarm(farmRes.data);
      //농장 번호로 농장동 리스트 가져오기
      const sectionRes = await farmSectionApi.getAllFarmSectionByFarmNo(
        farmRes.data.farmNo
      );
      setFarmSectionList(sectionRes.data);
    } catch (e) {
      console.error("데이터 로딩 실패", e);
    }
  };
  //들어왔을 때 토큰이 없으면 메인으로, 있으면 데이터 가져오기
  useEffect(() => {
    if (!token) {
      navigate("/main");
      return;
    }
    fetchData();
  }, [token]);

  //Submit 버튼 클릭 시 데이터 전송
  const handleSubmit = async () => {
    try {
      if (input.chickDisposalNumber) {
        const res1 = await chickDisposalApi.createChickDisposal({
          chickDisposalNumber: input.chickDisposalNumber,
          chickDisposalDate: input.date,
          farmSectionNo: input.farmSectionNo,
        });
        if (res1.status !== responseStatus.CREATED_CHICK_DISPOSAL_SUCCESS)
          throw new Error("도사 등록 실패");
      }
      //DeathNumber가 있으면
      if (input.chickDeathNumber) {
        //
        const res2 = await chickDeathApi.createChickDeath({
          chickDeathNumber: input.chickDeathNumber,
          chickDeathDate: input.date,
          farmSectionNo: input.farmSectionNo,
        });
        if (res2.status !== responseStatus.CREATED_CHICK_DEATH_SUCCESS)
          throw new Error("폐사 등록 실패");
      }

      alert("성공적으로 입력되었습니다.");
      navigate("/farm-section");
    } catch (err) {
      console.error(err);
      alert("입력 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-container">
        <h2 className="form-title">도사 / 폐사 수 등록</h2>

        <form className="form-vertical">
          <div className="form-row-horizontal">
            <label>농장 이름</label>
            <input type="text" value={farm.farmName} readOnly />
          </div>

          <label>농장 구역</label>
          <div className="grid-sections">
            {farmSectionList.map((section) => (
              <button
                type="button"
                key={section.farmSectionNo}
                className={`section-box ${
                  input.farmSectionNo === String(section.farmSectionNo)
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectSection(String(section.farmSectionNo))}
              >
                {section.farmSectionName}
              </button>
            ))}
          </div>

          <label>날짜</label>
          <input
            type="date"
            name="date"
            value={input.date}
            onChange={handleChange}
          />
          <div className="number-input">
            <div className="number-field">
              <label htmlFor="chickDisposalNumber">도사 수</label>
              <input
                id="chickDisposalNumber"
                type="number"
                name="chickDisposalNumber"
                placeholder="예: 200"
                onChange={handleChange}
              />
            </div>

            <div className="number-field">
              <label htmlFor="chickDeathNumber">폐사 수</label>
              <input
                id="chickDeathNumber"
                type="number"
                name="chickDeathNumber"
                placeholder="예: 200"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
