# React 프로젝트 생성

## Vite로 프로젝트 생성

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

## 왜 Vite인가?

- **빠른 개발 서버**: ESM 기반 HMR (Hot Module Replacement)
- **간단한 설정**: 최소한의 config로 시작 가능
- **TypeScript 지원**: 별도 설정 없이 바로 사용

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 단위 컴포넌트
├── hooks/          # 커스텀 훅
├── api/            # API 호출 함수
├── App.tsx         # 루트 컴포넌트
└── main.tsx        # 엔트리 포인트
```
