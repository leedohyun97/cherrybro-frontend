import { Cookies } from "react-cookie";  // react-cookie 라이브러리 사용

// Cookies 인스턴스 생성
const cookies = new Cookies();

// 쿠키 설정 함수
export const setCookie = (name, value, days) => {
     // 현재 날짜
    const expires = new Date(); 
    // days 만큼 유효기간 설정
    expires.setUTCDate(expires.getUTCDate() + days);  

    return cookies.set(name, value, { path: "/", expires: expires });  
};

// 쿠키 가져오기 함수
export const getCookie = (cookieName) => {
    // 쿠키 이름 패턴
    const name = `${cookieName}=`;  
    // 쿠키 문자열 디코딩
    const decodedCookie = decodeURIComponent(document.cookie); 
    // 쿠키들을 배열로 나눔
    const cookieArray = decodedCookie.split(";");  

    // 쿠키 배열 순회
    for(let cookie of cookieArray) {
        // 앞뒤 공백 제거
        cookie = cookie.trim();
        // 쿠키 이름이 찾는 이름(name)으로 시작하면
        if(cookie.startsWith(name)) {
            // 쿠키 값만 추출
            const value = cookie.substring(name.length);
            try {
                // Base64 디코딩 (만약 인코딩된 값일 경우)
                const decodedValue = atob(value);
                 // JSON 객체로 변환해서 반환
                return JSON.parse(decodedValue);
            } catch (error) {
                console.warn("Failed to decode cookie", error);
                // 디코딩 실패하면 그냥 value 사용
                return JSON.parse(value);  
            }
        }
    }
    // 쿠키 없으면 null 반환
    return null;  
};

// 쿠키 삭제 함수
export const removeCookie = (name, path = "/") => {
     // path 기준으로 쿠키 삭제
    cookies.remove(name, {path}); 
};
