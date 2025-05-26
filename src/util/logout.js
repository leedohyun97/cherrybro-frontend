import { removeCookie } from "./cookie";

// 로그아웃 함수: 쿠키 삭제 + 상태 초기화
export const logout = () => {
        removeCookie("users");  // "users" 쿠키 삭제
        window.location.href = "/login";
    };