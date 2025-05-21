import React, { useEffect } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsersAuth } from '../util/authContext';
import * as farmApi from '../api/farmApi';
import * as farmSectionApi from '../api/farmSectionApi';
import * as chickDisposalApi from '../api/chickDisposalApi';
import { toast } from 'react-toastify';

export default function ChickDisposalDetailPage() {

    const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

    const {token, users} = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
    console.log("users : ", users);
    console.log("usersNo : ", usersNo);

    const [farm, setFarm] = useState(null); // 농장 정보를 저장할 배열열

    const [farmSections, setFarmSections] = useState([]); // 농장 구역 정보를 저장할 배열

    const [chickDisposals, setChickDisposals] = useState([]); // 병아리 입고 정보를 저장할 배열

    const [loading, setLoading] = useState(true); // 로딩 상태를 저장할 변수

    const deleteAction = async (chickDisposalNo) => {
        if (window.confirm("도사 내역을 삭제하시겠습니까?")) {
            try {
                await chickDisposalApi.deleteChickDisposal(chickDisposalNo); // 병아리 입고 정보 삭제 API 호출
                toast.success("삭제되었습니다.");
                navigate('/farm-section'); // 삭제 후 병아리 입고 목록 페이지로 이동
            } catch (error) {
                console.error("Error deleting chick entry:", error); // 에러를 콘솔에 출력한다
            }
        }
    };


    useEffect(() => {
      if (!usersNo) return; // usersNo가 아직 준비 안 됐으면 실행 안 함
        const fetchAllData = async () => { 
          try {
                const getMyFarm = await farmApi.getMyFarm(token); // 사용자 번호로 농장 정보 조회
                const getMyFarmData = getMyFarm.data; // 농장 정보
                setFarm(getMyFarmData); // 농장 정보를 상태에 저장

                const getAllFarmSectionByFarmNo = await farmSectionApi.getAllFarmSectionByFarmNo(getMyFarmData.farmNo); // 농장 번호로 농장 구역 정보 조회
                const getAllFarmSectionByFarmNoData = getAllFarmSectionByFarmNo.data; // 농장 구역 정보
                setFarmSections(getAllFarmSectionByFarmNoData); // 농장 구역 정보를 상태에 저장
                console.log("getAllFarmSectionByFarmNoData", getAllFarmSectionByFarmNoData);
                
                
                const chickDisposalResponse = getAllFarmSectionByFarmNoData.map((section => 
                  chickDisposalApi.getChickDisposalByFarmSectionNo(section.farmSectionNo).then(response => response.data) // 농장 구역 번호로 병아리 입고 정보 조회
                ));

                const chickDisposalResult = await Promise.all(chickDisposalResponse); // 모든 API 호출이 완료될 때까지 대기
                console.log("chickDisposalResult", chickDisposalResult);
                const chickDisposalFlattened = chickDisposalResult.flat(); // 중첩된 배열을 평탄화
                console.log("chickDisposalFlattened", chickDisposalFlattened);
                const chickDisposalSort = chickDisposalFlattened.sort((a, b) => new Date(b.chickDisposalCreateAt) - new Date(a.chickDisposalCreateAt)); // 병아리 입추 정보를 등록 날짜 기준으로 내림차순 정렬
                console.log("chickDisposalSort", chickDisposalSort);
                
                setChickDisposals(chickDisposalSort); // 병아리 입고 정보를 상태에 저장
                
            } catch (error) {
                console.error("Error fetching data:", error); // 에러를 콘솔에 출력한다
            } finally {
                setLoading(false); // 로딩 상태를 false로 변경
            }
        };

        fetchAllData();
    },[token]);


  return (
    <div className="admin-page">
      <h2>전체 도사 내역</h2>

      <table className="admin-table">
        <thead>
            <tr>
                <th>농장</th>
                <th>동</th>
                <th>입추일</th>
                <th>입추 등록일</th>
                <th>수량</th>
            <th/>
          </tr>
        </thead>

        <tbody>
          {chickDisposals.map((disposal) => {
            /* 1) 동 찾기: farmSection 배열에서 번호 일치하는 객체 찾기 */
            const findSection = farmSections.find(section => section.farmSectionNo === disposal.farmSectionNo) || {};

            return (
              <tr key={disposal.chickDisposalNo}>
                <td>{farm.farmName || '-'}</td>
                <td>{findSection.farmSectionName || '-'}</td>
                <td>{disposal.chickDisposalDate}</td>
                <td>{disposal.chickDisposalCreateAt !== null ? disposal.chickDisposalCreateAt.slice(0, 16).replace('T', ' ') : 0}</td>
                <td>{disposal.chickDisposalNumber?.toLocaleString()}</td>
                <td className="right">
                  <button className="del-btn" onClick={() => deleteAction(disposal.chickDisposalNo)}>
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}
