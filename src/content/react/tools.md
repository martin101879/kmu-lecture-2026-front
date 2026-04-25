# 개발 도구

## TypeScript

React는 JavaScript로 작성할 수 있지만, 이 강의에서는 **TypeScript**를 사용합니다.

```tsx
// JavaScript - 타입이 없어서 런타임에 오류 발생 가능
function add(a, b) {
  return a + b;
}
add("1", 2); // "12" (의도하지 않은 문자열 결합)

// TypeScript - 타입을 명시해서 컴파일 시점에 오류 감지
function add(a: number, b: number): number {
  return a + b;
}
add("1", 2); // 컴파일 에러! string은 number에 할당할 수 없음
```

| | JavaScript | TypeScript |
|---|---|---|
| 타입 | 동적 (런타임에 결정) | 정적 (컴파일 시 체크) |
| 오류 감지 | 실행해봐야 알 수 있음 | 코드 작성 시점에 감지 |
| 자동완성 | 제한적 | IDE에서 강력한 자동완성 지원 |
| 학습 부담 | 낮음 | JavaScript + 타입 문법 |

> TypeScript는 JavaScript의 상위 집합(Superset)입니다. 모든 JavaScript 코드는 유효한 TypeScript 코드이며, 여기에 타입 시스템을 추가한 것입니다.

## npm

npm은 JavaScript/TypeScript 프로젝트의 **패키지 매니저**입니다. Backend의 Gradle과 같은 역할입니다.

| npm (Frontend) | Gradle (Backend) | 역할 |
|----------------|-----------------|------|
| `package.json` | `build.gradle.kts` | 프로젝트 설정 + 의존성 목록 |
| `npm run build` | `./gradlew build` | 빌드 |
| `npm run dev` | `./gradlew bootRun` | 개발 서버 실행 |
| `node_modules/` | `.gradle/` | 다운로드된 의존성 저장 |

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm install` | `package.json`에 정의된 의존성 설치 |
| `npm install {패키지명}` | 새 패키지 추가 |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |

## Vite

Vite는 React 프로젝트의 **빌드 도구**입니다. npm이 패키지를 설치/관리하는 도구라면, Vite는 브라우저가 이해할 수 없는 TSX 파일을 JS로 **변환**하고, 여러 파일을 하나로 **번들링**하는 도구입니다.

```
npm:   패키지 설치/관리 (react, react-dom 등을 다운로드)
Vite:  TSX → JS 변환 + 개발 서버 + 번들링 (배포용 파일 생성)
```

`npm run dev`를 실행하면 npm이 직접 서버를 띄우는 것이 아니라, `package.json`의 `scripts`에 정의된 `vite` 명령어를 실행합니다. 실제 개발 서버를 띄우고 코드를 변환하는 것은 Vite입니다.

| 특징 | 설명 |
|------|------|
| 빠른 개발 서버 | ESM 기반으로 즉시 시작 |
| HMR (Hot Module Replacement) | 코드 수정 시 브라우저가 자동으로 변경된 부분만 반영 |
| 빠른 빌드 | Rolldown 기반 번들링 |
| 간단한 설정 | 최소한의 config로 시작 가능 |

> 과거에는 `create-react-app`을 사용했지만, 현재는 Vite가 React 프로젝트 생성의 표준입니다.

## CSS 스타일링

React에서 CSS를 적용하는 방법은 여러 가지가 있습니다.

| 방식 | 특징 |
|------|------|
| **CSS Modules** | 파일 단위 스코프 격리, 별도 설치 불필요 |
| Tailwind CSS | 유틸리티 클래스 기반, 실무에서 많이 사용 |
| styled-components | JS 안에서 CSS 작성 (CSS-in-JS) |
| 일반 CSS | 가장 단순, 글로벌 스코프 (이름 충돌 가능) |

실무에서 가장 많이 사용되는 두 가지를 비교합니다.

### CSS Modules

별도 `.module.css` 파일에 일반 CSS를 작성합니다. 클래스명이 자동으로 고유화되어 컴포넌트 간 스타일 충돌이 없습니다.

```css
/* Button.module.css */
.button {
  background: #3182f6;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>클릭</button>;
}
```

### Tailwind CSS

CSS 파일 없이, 미리 정의된 **유틸리티 클래스**를 JSX에 직접 나열합니다. `bg-blue-500`은 "배경색 파란색", `p-3`은 "padding 12px" 같은 의미입니다.

```tsx
// Button.tsx - 별도 CSS 파일 불필요
function Button() {
  return <button className="bg-blue-500 text-white p-3 rounded-lg">클릭</button>;
}
```

### 비교

| | CSS Modules | Tailwind CSS |
|---|---|---|
| CSS 작성 위치 | 별도 `.module.css` 파일 | JSX 안에 클래스명 나열 |
| 문법 | 일반 CSS 그대로 | 미리 정의된 유틸리티 클래스 |
| 장점 | CSS를 아는 사람이 바로 사용 가능 | CSS 파일 관리 불필요, 빠른 개발 |
| 단점 | 파일이 늘어남 | 클래스명이 길어져 JSX가 복잡해질 수 있음 |
| 추가 설치 | 불필요 (Vite 기본 지원) | 설치 필요 |

이 강의에서는 **CSS Modules**를 사용합니다. 별도 설치가 필요 없고, 이미 아는 CSS 문법을 그대로 사용할 수 있기 때문입니다.

> 실무에서는 Tailwind CSS의 사용 비율이 빠르게 늘고 있습니다. 관심이 있다면 캡스톤 프로젝트에서 사용해보세요. 공식 사이트: [tailwindcss.com](https://tailwindcss.com)
