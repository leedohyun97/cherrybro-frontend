import React, { useEffect, useMemo } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsersAuth } from '../util/authContext';
import * as farmApi from '../api/farmApi';
import * as farmSectionApi from '../api/farmSectionApi';
import * as chickEntryApi from '../api/chickEntryApi';


export default function ChickEntryDetailPage() {
    const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

    const {token, users} = useUsersAuth();// 사용자 인증 정보를 가져온다
    const usersNo = users?.usersNo || null; //사용자 번호를 가져온다
    
    const [farm, setFarm] = useState([]); // 농장 정보를 저장할 배열열

    const [farmSection, setFarmSection] = useState([]); // 농장 구역 정보를 저장할 배열

    const [chickEntry, setChickEntry] = useState([]); // 병아리 입고 정보를 저장할 배열

    const [loading, setLoading] = useState(true); // 로딩 상태를 저장할 변수

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const getAllFarm = await farmApi.getAllFarm(); // 농장 정보를 가져온다
                setFarm(getAllFarm.data); // 농장 정보를 상태에 저장한다
    
                const getAllFarmSection = await farmSectionApi.getAllFarmSection(); // 농장 구역 정보를 가져온다
                setFarmSection(getAllFarmSection.data); // 농장 구역 정보를 상태에 저장한다
    
                const getAllChickEntry = await chickEntryApi.getAllChickEntries(); // 병아리 입고 정보를 가져온다
                setChickEntry(getAllChickEntry.data); // 병아리 입고 정보를 상태에 저장한다

            } catch (error) {
                console.error("Error fetching data:", error); // 에러를 콘솔에 출력한다
            } finally {
                setLoading(false); // 로딩 상태를 false로 변경
            }
        };
        fetchAllData();
    },[]);




  return (
    <div>
    </div>
  )
}
