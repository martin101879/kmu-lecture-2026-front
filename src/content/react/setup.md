# React 프로젝트 생성

## Vite로 프로젝트 생성

터미널에서 아래 명령어를 실행합니다.

```bash
npm create vite@latest balance-web
```

대화형 프롬프트가 나타나면 아래와 같이 선택합니다.

| 항목 | 선택 |
|------|------|
| Select a framework | **React** |
| Select a variant | **TypeScript** |

선택이 완료되면 프로젝트 폴더로 이동하고 의존성을 설치합니다.

```bash
cd balance-web
npm install
```

### 생성된 프로젝트 구조

```
balance-web/
├── index.html                ← 앱의 진입점 HTML
├── package.json              ← 프로젝트 설정 + 의존성 목록
├── tsconfig.json             ← TypeScript 설정
├── vite.config.ts            ← Vite 설정
├── public/                   ← 정적 파일 (빌드 시 그대로 복사)
└── src/
    ├── main.tsx              ← JavaScript 엔트리 포인트
    ├── App.tsx               ← 루트 컴포넌트
    ├── App.css               ← App 컴포넌트 스타일
    ├── index.css             ← 글로벌 스타일
    └── assets/               ← 이미지 등 에셋
```

## 앱이 시작되는 흐름

브라우저가 React 앱을 로드하는 순서입니다.

```
① index.html 로드 → ② main.tsx 실행 → ③ App 컴포넌트 렌더링
```

### index.html

브라우저가 가장 먼저 읽는 파일입니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>밸런스 게임</title>
  </head>
  <body>
    <div id="root"></div>                          <!-- React가 렌더링할 빈 컨테이너 -->
    <script type="module" src="/src/main.tsx"></script>  <!-- main.tsx 실행 -->
  </body>
</html>
```

핵심은 두 줄입니다:
- `<div id="root"></div>` — React가 UI를 그려 넣을 **빈 컨테이너**
- `<script src="/src/main.tsx">` — React 앱을 **시작시키는 스크립트**

### main.tsx

`index.html`에서 로드된 `main.tsx`가 실행되면, 빈 `<div id="root">`에 React 컴포넌트를 렌더링합니다.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!)  // ① 실제 DOM의 <div id="root">를 찾음
  .render(                                     // ② 이 DOM 안에 React를 렌더링
    <StrictMode>                               // ③ 개발 모드 검사 활성화
      <App />                                  // ④ 루트 컴포넌트
    </StrictMode>,
  );
```

| 코드 | 역할 |
|------|------|
| `document.getElementById('root')` | `index.html`의 `<div id="root">`를 찾음 |
| `!` | TypeScript에게 "이 값은 null이 아님"을 보장 |
| `createRoot()` | React가 이 DOM 요소를 루트로 관리하기 시작 |
| `.render()` | 전달한 컴포넌트를 렌더링 |
| `<StrictMode>` | 개발 모드에서 잠재적 문제를 감지 (프로덕션에서는 무시됨) |
| `<App />` | 모든 컴포넌트의 최상위 루트 |

```
index.html의 <div id="root"></div>    ← 실제 DOM (빈 div)
        ↓
createRoot('root')                     ← React가 이 div를 관리하겠다고 선언
        ↓
.render(<App />)                       ← App의 가상 DOM을 생성하고 실제 DOM에 반영
        ↓
이후 State 변경 시                      ← 가상 DOM 비교 → 변경분만 실제 DOM 업데이트
```

> React 앱은 **하나의 빈 `<div>`에서 시작**해서, 모든 UI를 JavaScript로 만들어 채워 넣습니다. 이것이 SPA이자 CSR인 이유입니다.

## package.json

Backend의 `build.gradle.kts`에 해당하는 파일입니다. 프로젝트 설정, 의존성, 스크립트가 모두 정의되어 있습니다.

```json
{
  "name": "balance-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",                    // 개발 서버 실행
    "build": "tsc -b && vite build",  // TypeScript 체크 + 프로덕션 빌드
    "lint": "eslint .",               // 코드 스타일 검사
    "preview": "vite preview"         // 빌드 결과물 미리보기
  },
  "dependencies": {
    "react": "^19.x.x",              // React 라이브러리
    "react-dom": "^19.x.x"           // React DOM 렌더러
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.x.x", // Vite React 플러그인
    "typescript": "~6.x.x",           // TypeScript 컴파일러
    "vite": "^8.x.x"                  // Vite 빌드 도구
  }
}
```

### scripts

`npm run {스크립트명}`으로 실행합니다.

| 명령어 | 스크립트 | 설명 |
|--------|---------|------|
| `npm run dev` | `vite` | 개발 서버 실행 (HMR 지원) |
| `npm run build` | `tsc -b && vite build` | TypeScript 체크 + 프로덕션 빌드 |
| `npm run lint` | `eslint .` | 코드 스타일 검사 |
| `npm run preview` | `vite preview` | 빌드 결과물 미리보기 |

### dependencies vs devDependencies

| | dependencies | devDependencies |
|---|---|---|
| 용도 | 앱 실행에 필요한 라이브러리 | 개발/빌드에만 필요한 도구 |
| 예시 | react, react-dom | vite, typescript, eslint |
| 빌드 결과물 | 포함됨 | 포함되지 않음 |

## 개발 서버 실행

```bash
npm run dev
```

```
  VITE v8.x.x  ready in 200ms

  ➜  Local:   http://localhost:5173/
```

브라우저에서 `http://localhost:5173`에 접속하면 Vite 기본 화면이 표시됩니다.

> 코드를 수정하면 브라우저가 자동으로 반영됩니다 (HMR). 새로고침할 필요가 없습니다.

## 실습: 보일러플레이트 정리

Vite가 생성한 기본 코드(로고, 카운터 등)를 제거하고 깔끔하게 시작합니다. 기존 `App.css`를 삭제하고 `App.module.css`를 생성합니다.

```css
/* src/App.module.css */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
}
```

```tsx
// src/App.tsx
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>밸런스 게임</h1>
      <p>당신의 선택은?</p>
    </div>
  );
}

export default App;
```

브라우저에서 `http://localhost:5173`에 접속하여 "밸런스 게임" 제목이 표시되면 준비 완료입니다.

> 다음 단계 **밸런스 게임 화면 만들기**에서 본격적으로 컴포넌트를 작성합니다.
