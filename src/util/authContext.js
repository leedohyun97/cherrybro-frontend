import {createContext, useContext, useEffect, useState } from "react";
import { getCookie, removeCookie } from "./cookie";
import { jwtDecode } from "jwt-decode";

/* 컴포넌트 전역에서 데이터를 공유하는 Context 생성 */
const AuthContext = createContext();

// AuthProvider 컴포넌트: 전역 인증 상태(users 정보와 토큰)를 관리
export const AuthProvider = ({children}) => {
    
    // token과 users 정보를 가지는 상태 선언 (초기값: 빈 토큰과 빈 객체)
    const [users, setUsers] = useState ({
        token:'',
        users:{}
    });

    // 페이지가 처음 로드될 때 실행되는 useEffect
    useEffect(() => {
        const cookie = getCookie("users");  // "users" 이름의 쿠키 값을 가져옴

        // 쿠키와 accessToken이 존재하면 → 상태에 반영
        if(cookie && cookie.accessToken) {
            const decoded = jwtDecode(cookie.accessToken);  // 토큰 디코드 (users 정보 포함)

            setUsers({
                token:cookie.accessToken,  // 토큰 저장
                users:decoded              // 디코딩한 사용자 정보 저장
            });
        }
    }, []);

    // 로그인 함수: 토큰을 상태에 저장
    const login = (token) => {
        // 토큰 디코드
        const decoded = jwtDecode(token);  
        setUsers({
            token,
            users:decoded
        });
    };

    // 로그아웃 함수: 쿠키 삭제 + 상태 초기화
    const logout = () => {
        removeCookie("users");  // "users" 쿠키 삭제
        setUsers({
            token: null,
            users: null
        });
    };

    // Provider로 하위 컴포넌트에 데이터 제공
    return (
        <AuthContext.Provider value={{ token: users.token, users: users.users , login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Context를 쉽게 사용하기 위한 커스텀 훅
export const useUsersAuth = () => useContext(AuthContext);

