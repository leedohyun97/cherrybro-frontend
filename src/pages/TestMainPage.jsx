import React from "react";
import { useNavigate } from "react-router-dom";
import 한국원종 from "../images/한국원종.png";

export default function TestMainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lime-50 text-gray-800">
      {/* ===== 상단 네비바 ===== */}
      <header className="flex justify-between items-center px-6 py-2 border-b border-gray-200 bg-white">
        <img src={한국원종} alt="로고" className="w-32 h-auto"></img>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="font-noto font-semibold bg-white border border-gray-300 text-gray-800 px-5 py-1 rounded-lg font-semibold hover:bg-yellow-400 hover:text-white transition duration-300"
          >
            로그인
          </button>

          <button
            onClick={() => navigate("/register")}
            className="font-noto bg-black text-white px-5 py-1 rounded-lg font-semibold hover:bg-yellow-400 hover:text-white transition duration-300"
          >
            회원가입
          </button>

          <button
            onClick={() => navigate("/main")}
            className="font-noto font-semibold bg-white border border-gray-300 text-gray-800 px-5 py-1 rounded-lg font-semibold hover:bg-yellow-400 hover:text-white transition duration-300"
          >
            콘솔
          </button>
        </div>
      </header>

      {/* ===== Hero 섹션 ===== */}
      <section className="text-center mt-20 px-4">
        <h2 className="text-4xl font-extrabold mb-4">
          병아리 사육 관리 시스템
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          입추부터 폐사까지, 마릿수를 쉽고 정확하게 관리하세요
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500"
        >
          지금 시작하기 →
        </button>
      </section>

      {/* ===== 기능 카드 섹션 ===== */}
      <section className="mt-24 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: "🐣",
            title: "입추 수 등록",
            desc: "농장별 입추 마릿수를 기록하고 관리하세요.",
          },
          {
            icon: "💀",
            title: "폐사/도사 기록",
            desc: "도태/폐사 수를 날짜별로 기록하고 확인하세요.",
          },
          {
            icon: "📊",
            title: "실시간 통계",
            desc: "육성율을 자동 계산해 시각화합니다.",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{desc}</p>
          </div>
        ))}
      </section>

      {/* ===== 푸터 ===== */}
      <footer className="mt-24 text-center text-sm text-gray-400 py-6">
        © 2025 한국원종
      </footer>
    </div>
  );
}
