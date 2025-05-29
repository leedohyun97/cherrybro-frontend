/* ─────────────────── import 구문 ─────────────────── */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as farmApi from "../api/farmApi";
import * as farmSectionApi from "../api/farmSectionApi";
import * as chickEntryApi from "../api/chickEntryApi";
import * as chickDeathApi from "../api/chickDeathApi";
import * as chickDisposalApi from "../api/chickDisposalApi";
import { useUsersAuth } from "../util/authContext";

export default function ChickDetailPage() {
  /* ──────────────── 전역 상태 선언 ──────────────── */
  const { token } = useUsersAuth();
  const { farmSectionNo } = useParams();

  const [farm, setFarm] = useState(null);
  const [farmSection, setFarmSection] = useState(null);
  const [entry, setEntry] = useState(null); //입추는 한 번만
  const [deathList, setDeathList] = useState([]);
  const [disposalList, setDisposalList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ──────────────── 데이터 fetch 함수 ──────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!token) return;

        const farmSectionRes =
          await farmSectionApi.getFarmSectionByFarmSectionNo(farmSectionNo);
        setFarmSection(farmSectionRes.data);

        const farmRes = await farmApi.getFarmByFarmNo(
          token,
          farmSectionRes.data.farmNo
        );
        setFarm(farmRes.data);

        const [entryRes, deathRes, disposalRes] = await Promise.all([
          chickEntryApi.getAllChickEntries(),
          chickDeathApi.getAllChickDeath(),
          chickDisposalApi.getAllChickDisposal(),
        ]);

        const findEntry = entryRes.data.find(
          (e) => e.farmSectionNo === Number(farmSectionNo)
        );
        setEntry(findEntry);

        setDeathList(
          deathRes.data.filter((d) => d.farmSectionNo === Number(farmSectionNo))
        );
        setDisposalList(
          disposalRes.data.filter(
            (d) => d.farmSectionNo === Number(farmSectionNo)
          )
        );
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, farmSectionNo]);

  /* ──────────────── 로딩 화면 처리 ──────────────── */
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  /* ──────────────── 날짜/입추 기본 계산 ──────────────── */
  const entryDate = new Date(entry.chickEntryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entryCount = Number(entry.chickEntryNumber) || 0;

  /* ──────────────── 날짜 유틸 함수 ──────────────── */
  const formatDate = (d) => new Date(d).toISOString().slice(0, 10);
  const generateDateListFrom = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  /* ──────────────── 일령별 누적 데이터 생성 ──────────────── */
  const dateList = generateDateListFrom(entryDate, today);
  let live = entryCount;

  const dailyData = dateList.map((date, index) => {
    const dateStr = formatDate(date);
    const dayAge = index + 1;

    const deathSum = deathList
      .filter((d) => formatDate(d.chickDeathDate) === dateStr)
      .reduce((sum, d) => sum + d.chickDeathNumber, 0);

    const disposalSum = disposalList
      .filter((d) => formatDate(d.chickDisposalDate) === dateStr)
      .reduce((sum, d) => sum + d.chickDisposalNumber, 0);

    const result = {
      dayAge,
      dateStr,
      entry: dayAge === 1 ? entryCount : "-",
      deathSum,
      disposalSum,
      live,
    };

    live -= deathSum + disposalSum;
    return result;
  });

  /* ──────────────── 상단 카드 데이터 계산 ──────────────── */
  const totalDeath = deathList.reduce(
    (sum, d) => sum + (Number(d.chickDeathNumber) || 0),
    0
  );
  const totalDisposal = disposalList.reduce(
    (sum, d) => sum + (Number(d.chickDisposalNumber) || 0),
    0
  );
  const totalLive = dailyData[dailyData.length - 1]?.live || entryCount;

  /* ──────────────── 렌더링 시작 ──────────────── */
  return (
    <div className="table-wrap">
      <h2 style={{ marginBottom: "1rem" }}>
        {farm.farmName} {farmSection.farmSectionName} 일령별 현황
      </h2>

      {/* ───── 상단 통계 카드 영역 ───── */}
      <section className="summary-wrap">
        {[
          { label: "입추 수", value: entryCount },
          { label: "누적 도사", value: totalDisposal },
          { label: "누적 폐사", value: totalDeath },
          { label: "현재 마릿수", value: totalLive },
        ].map((c) => (
          <div key={c.label} className="summary-card">
            <p className="card-label">{c.label}</p>
            <p className="card-value">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </section>

      {/* ───── 일령별 상세 테이블 영역 ───── */}
      <table>
        <thead>
          <tr>
            <th>일령</th>
            <th>날짜</th>
            <th>입추수</th>
            <th>폐사수</th>
            <th>도사수</th>
            <th>현재 마릿수</th>
          </tr>
        </thead>
        <tbody>
          {dailyData
            .slice()
            .reverse()
            .map((d) => (
              <tr key={d.dateStr}>
                <td>{d.dayAge}일령</td>
                <td>{d.dateStr}</td>
                <td>
                  {typeof d.entry === "number" ? d.entry.toLocaleString() : "-"}
                </td>
                <td className={d.deathSum !== 0 ? "red" : ""}>{d.deathSum}</td>
                <td className={d.disposalSum !== 0 ? "red" : ""}>
                  {d.disposalSum}
                </td>
                <td>{d.live >= 0 ? d.live.toLocaleString() : 0}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
