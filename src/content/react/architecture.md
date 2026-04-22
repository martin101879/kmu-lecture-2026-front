# 핵심 구조

React 애플리케이션은 **컴포넌트 트리**로 구성됩니다. 아래는 밸런스 게임의 컴포넌트 구조입니다.

![React 컴포넌트 트리](/images/react-component-tree.svg)

- **Props** (파란 화살표): 데이터가 부모 → 자식으로 전달
- **Events** (빨간 화살표): 이벤트(클릭, 입력 등)가 자식 → 부모로 전달

이 구조를 이해하기 위해 컴포넌트, JSX, Props, State, Hooks를 하나씩 살펴봅니다.

## 컴포넌트

React에서 UI는 **컴포넌트**라는 재사용 가능한 조각으로 구성됩니다. 각 컴포넌트는 자신만의 UI와 로직을 가진 독립적인 단위입니다.

```tsx
// 가장 간단한 컴포넌트 - 함수가 JSX를 반환
function Header() {
  return <h1>밸런스 게임</h1>;
}
```

컴포넌트를 조합해서 복잡한 UI를 만듭니다.

```tsx
function App() {
  return (
    <div>
      <Header />          {/* 헤더 컴포넌트 */}
      <GameList />         {/* 게임 목록 컴포넌트 */}
      <GameForm />         {/* 게임 생성 폼 컴포넌트 */}
    </div>
  );
}
```

## JSX

JSX는 JavaScript 안에서 **HTML처럼** UI를 작성할 수 있는 문법입니다. 브라우저가 직접 이해하지는 못하고, 빌드 시 JavaScript로 변환됩니다.

```tsx
// JSX - HTML처럼 보이지만 JavaScript
function GameCard() {
  const title = "점심 메뉴 고르기";

  return (
    <div className="game-card">          {/* class 대신 className 사용 */}
      <h2>{title}</h2>                    {/* {} 안에 JavaScript 표현식 사용 */}
      <button onClick={() => alert("클릭!")}>선택</button>
    </div>
  );
}
```

### HTML과의 차이

| HTML | JSX | 이유 |
|------|-----|------|
| `class` | `className` | `class`는 JavaScript 예약어 |
| `for` | `htmlFor` | `for`는 JavaScript 예약어 |
| `onclick` | `onClick` | 카멜 케이스 사용 |
| 닫는 태그 필수 아님 | 항상 필수 | `<img />`, `<br />` |

## Props

Props는 **부모 컴포넌트가 자식 컴포넌트에 전달하는 데이터**입니다. 함수의 매개변수와 같은 개념입니다.

```tsx
// 부모 컴포넌트 - Props를 전달
function App() {
  return (
    <GameCard title="점심 메뉴 고르기" optionA="짜장면" optionB="짬뽕" />
  );
}

// 자식 컴포넌트 - Props를 받아서 사용
interface GameCardProps {
  title: string;
  optionA: string;
  optionB: string;
}

function GameCard({ title, optionA, optionB }: GameCardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button>{optionA}</button>
      <span>VS</span>
      <button>{optionB}</button>
    </div>
  );
}
```

> **Props는 읽기 전용**입니다. 자식 컴포넌트에서 Props를 수정할 수 없습니다.

## State (useState)

State는 **컴포넌트 내부에서 관리하는 데이터**입니다. State가 변경되면 컴포넌트가 자동으로 다시 렌더링됩니다.

```tsx
import { useState } from 'react';

function Counter() {
  // count: 현재 값, setCount: 값을 변경하는 함수
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>클릭 횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### Props vs State

| | Props | State |
|---|---|---|
| 데이터 소유 | 부모 컴포넌트 | 컴포넌트 자신 |
| 수정 가능 | 불가 (읽기 전용) | 가능 (`setState`) |
| 변경 시 | 부모가 변경하면 자식도 리렌더링 | 자신이 리렌더링 |

## useEffect

useEffect는 **컴포넌트가 렌더링된 후 실행되는 코드**를 정의합니다. API 호출, 타이머 설정 등 사이드 이펙트를 처리합니다.

```tsx
import { useState, useEffect } from 'react';

function GameList() {
  const [games, setGames] = useState([]);

  // 컴포넌트가 처음 렌더링될 때 API 호출
  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => setGames(data));
  }, []);  // [] = 처음 한 번만 실행

  return (
    <ul>
      {games.map((game) => (
        <li key={game.id}>{game.title}</li>
      ))}
    </ul>
  );
}
```

### 의존성 배열

`useEffect`의 두 번째 인자인 배열에 따라 실행 시점이 달라집니다.

| 의존성 배열 | 실행 시점 |
|-----------|----------|
| `[]` | 컴포넌트 마운트 시 **한 번만** 실행 |
| `[value]` | `value`가 변경될 때마다 실행 |
| 생략 | 매 렌더링마다 실행 (보통 사용하지 않음) |

## 리스트 렌더링과 key

배열 데이터를 렌더링할 때는 `map()`을 사용하고, 각 항목에 고유한 `key`를 부여해야 합니다.

```tsx
function GameList({ games }: { games: Game[] }) {
  return (
    <ul>
      {games.map((game) => (
        <li key={game.id}>    {/* key: React가 항목을 식별하는 고유값 */}
          {game.title}
        </li>
      ))}
    </ul>
  );
}
```

> `key`가 없으면 React가 리스트 변경 시 어떤 항목이 추가/삭제/변경되었는지 효율적으로 판단할 수 없습니다. **고유한 id**를 key로 사용하세요. 배열 index는 권장하지 않습니다.

## Spring Boot와의 비교

Spring Boot의 Controller → Service → Repository가 **요청의 흐름**이라면, React의 컴포넌트 트리는 **데이터(Props)의 흐름**입니다.

| | Spring Boot | React |
|---|---|---|
| 구조 | 계층 (Controller → Service → Repository) | 트리 (App → GameList → GameCard) |
| 데이터 흐름 | 위 → 아래 (요청 처리) | 부모 → 자식 (Props 전달) |
| 역방향 | 응답 반환 | 이벤트 콜백 (자식 → 부모) |
