# React란?

## UI 라이브러리

React는 사용자 인터페이스(UI)를 만들기 위한 **JavaScript 라이브러리**입니다. Meta(Facebook)에서 개발했으며, 현재 프론트엔드 개발에서 가장 많이 사용됩니다.

> React는 **프레임워크가 아닌 라이브러리**입니다. UI 렌더링에 집중하고, 라우팅/상태관리 등은 별도 라이브러리를 조합해서 사용합니다. (예: React Router, Redux)

| 특징 | 설명 |
|------|------|
| 컴포넌트 기반 | UI를 재사용 가능한 조각(컴포넌트)으로 나누어 조립 |
| 선언적 UI | "어떤 상태일 때 어떻게 보여줄지"를 선언하면 React가 화면을 업데이트 |
| 가상 DOM | 변경된 부분만 효율적으로 업데이트 |
| 생태계 | 방대한 라이브러리와 커뮤니티 |

## 왜 React인가?

| 프론트엔드 기술 | 특징 |
|---------------|------|
| **React** | 가장 큰 생태계, 채용 시장에서 가장 많이 요구 |
| Vue | 학습이 쉬움, 국내에서도 많이 사용 |
| Angular | 대규모 엔터프라이즈에서 사용, 러닝 커브 높음 |
| Svelte | 컴파일 기반, 빠르지만 생태계가 작음 |

이 강의에서는 **React**를 사용합니다. 채용 시장에서 가장 많이 요구되고, 학습 자료가 풍부합니다.

## SPA (Single Page Application)

React로 만드는 웹 애플리케이션은 **SPA** 방식입니다.

### 전통적인 웹 vs SPA

| | 전통적인 웹 (MPA) | SPA |
|---|---|---|
| 페이지 이동 | 서버에서 새 HTML을 받아 전체 페이지 새로고침 | 페이지 이동 없이 필요한 부분만 변경 |
| 사용자 경험 | 페이지 이동 시 깜빡임 | 앱처럼 부드러운 전환 |
| 예시 | 전통적인 쇼핑몰, 블로그 | Gmail, YouTube, 카카오맵 |

```
전통적인 웹:
  브라우저 → 서버에 페이지 요청 → 서버가 HTML 생성 → 전체 HTML 반환 → 화면 새로고침

SPA:
  브라우저 → 처음 한 번만 HTML/JS 로드 → 이후 페이지 전환 없이 화면 동적 업데이트
```

SPA는 처음 로딩 시 React 애플리케이션 전체를 다운로드하고, 이후에는 페이지 전환 없이 화면을 동적으로 업데이트합니다. 서버의 데이터가 필요한 경우 API를 호출하여 데이터를 주고받습니다.

### CSR vs SSR

SPA와는 별개로, **렌더링을 어디서 하느냐**에 따라 CSR과 SSR로 나뉩니다.

| | CSR (Client Side Rendering) | SSR (Server Side Rendering) |
|---|---|---|
| 렌더링 위치 | 브라우저(클라이언트) | 서버 |
| 초기 로딩 | 느림 (JS 전체 다운로드 후 렌더링) | 빠름 (완성된 HTML 반환) |
| SEO | 불리 (처음에 빈 HTML) | 유리 (완성된 HTML) |
| 대표 도구 | React, Vue | Next.js, Nuxt.js |
| 적합한 서비스 | 관리자 페이지, 대시보드, 앱 | 블로그, 쇼핑몰, 마케팅 사이트 |

React는 기본적으로 **CSR** 방식입니다. Next.js를 사용하면 React 기반으로 SSR을 적용할 수 있으며, SPA의 부드러운 페이지 전환도 함께 제공됩니다.

> 캡스톤 프로젝트에서 SEO가 중요한 서비스를 만든다면 Next.js를 고려해볼 수 있습니다.

## 가상 DOM과 선언적 UI

React는 CSR 방식으로 브라우저에서 화면을 렌더링합니다. 그러면 어떻게 효율적으로 화면을 업데이트할까요?

전통적인 웹 개발에서는 개발자가 **직접 DOM을 조작**했습니다.

```javascript
// 직접 DOM 조작 - 요소를 찾아서 하나하나 변경 (명령형)
const element = document.getElementById("count");
element.textContent = "5";

const button = document.querySelector(".btn");
button.style.backgroundColor = "red";
```

React는 이 방식 대신, **state를 변경하면 UI가 자동으로 반영**됩니다.

```tsx
// React - 상태만 선언하면 DOM은 React가 알아서 업데이트 (선언적)
function Counter() {
  const [count, setCount] = useState(0);

  return <p>{count}</p>;  // count가 바뀌면 React가 자동으로 DOM 업데이트
}
```

| | 직접 DOM 조작 | React (가상 DOM) |
|---|---|---|
| 방식 | `getElementById`로 요소를 찾아서 직접 변경 | state를 변경하면 React가 자동으로 DOM 반영 |
| 관점 | "이 요소를 이렇게 바꿔라" (명령형) | "이 상태일 때 이렇게 보여라" (선언적) |
| 복잡도 | UI가 복잡해지면 어떤 요소를 언제 바꿀지 관리가 어려움 | state만 관리하면 UI는 자동 반영 |

React는 실제 DOM이 아닌 **가상 DOM** (Virtual DOM)을 메모리에 유지하고, state가 변경되면 가상 DOM을 먼저 업데이트한 뒤 실제 DOM과의 차이만 반영합니다.

![가상 DOM 동작 원리](/images/react-virtual-dom.svg)

이처럼 React가 렌더링 대상(DOM)을 추상화했기 때문에, 웹 브라우저뿐만 아니라 다양한 환경에서 React의 컴포넌트 모델을 사용할 수 있습니다.

| 렌더링 대상 | 도구 | 설명 |
|-----------|------|------|
| 웹 브라우저 (DOM) | React DOM | 웹 애플리케이션 개발 (이 강의) |
| iOS / Android | React Native | 모바일 앱 개발 |
| 터미널 | Ink | 커맨드 라인 프로그램 개발 |

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

| Gradle (Backend) | npm (Frontend) | 역할 |
|-----------------|----------------|------|
| `build.gradle.kts` | `package.json` | 프로젝트 설정 + 의존성 목록 |
| `./gradlew build` | `npm run build` | 빌드 |
| `./gradlew bootRun` | `npm run dev` | 개발 서버 실행 |
| `.gradle/` | `node_modules/` | 다운로드된 의존성 저장 |

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm install` | `package.json`에 정의된 의존성 설치 |
| `npm install {패키지명}` | 새 패키지 추가 |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |

## Vite

Vite는 React 프로젝트의 **빌드 도구**입니다. 개발 서버와 프로덕션 빌드를 담당합니다.

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

이 강의에서는 **CSS Modules**를 사용합니다. `*.module.css` 파일로 작성하면 클래스명이 자동으로 고유화되어 컴포넌트 간 스타일 충돌이 없습니다.

```css
/* Button.module.css */
.button {
  background: #3182f6;
  color: #fff;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>클릭</button>;
}
```
