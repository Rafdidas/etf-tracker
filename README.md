# ETF Tracker

📈 개인 투자 ETF/계좌 추적 사이드 프로젝트  
Next.js 15 (App Router) + TypeScript + React Query + Tailwind + SCSS + Firebase

---

## 🚀 프로젝트 소개
ETF 보유 내역과 ISA/연금저축 계좌 한도를 추적하고,  
실시간 평가액·수익률·환율 변환을 제공합니다.  

- 전체 투자금 / 평가액 / 총 수익률 대시보드
- 계좌별 한도 게이지 (ISA, 연금저축, IRP)
- 보유 ETF 리스트 (종목명, 현재가, 평가액, 수익률)
- 정렬/필터 (수익률 높은 순, 자산군별)
- 납입액 기록 + 연도별 차트
- 알림 (ETF 목표가, 계좌 한도 80% 초과 시)

---

## 🛠️ 기술 스택
- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router) + TypeScript  
- **State**: [React Query](https://tanstack.com/query/latest)  
- **UI**: Tailwind CSS + SCSS Modules  
- **DB/Auth**: Firebase (Firestore + Auth)  
- **API**: 
  - [Alpha Vantage](https://www.alphavantage.co/) (ETF 시세)
  - [Exchangerate.host](https://exchangerate.host/) (환율)
- **배포**: Vercel

---

## 📂 프로젝트 구조 (예정)
