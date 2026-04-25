# 핵심 구조

React의 핵심 동작 원리는 단순합니다. **State가 바뀌면 화면이 바뀝니다.**

![React 핵심 구조](/images/react-component-tree.svg)

1. **State**가 화면에 반영됨
2. 사용자가 화면에서 **클릭** 등 조작
3. **setState**로 State를 변경
4. 변경된 State가 다시 화면에 반영 → 반복

이 순환을 구성하는 핵심 요소가 **Component**, **State**, **Props**입니다. 하나씩 살펴봅니다.

## Component

React에서 UI는 **컴포넌트**라는 재사용 가능한 조각으로 구성됩니다. 각 컴포넌트는 자신만의 UI와 로직을 가진 독립적인 단위입니다. Spring Boot에서는 클래스에 `@Component`를 붙여서 컴포넌트를 만들었지만, React에서는 **함수 자체가 컴포넌트**입니다.

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
      <Content />         {/* 콘텐츠 컴포넌트 */}
      <Footer />          {/* 푸터 컴포넌트 */}
    </div>
  );
}
```

### JSX

컴포넌트가 반환하는 `<div>`, `<h1>` 같은 문법을 **JSX**라고 합니다. JavaScript 안에서 HTML처럼 UI를 작성할 수 있는 문법입니다. HTML처럼 보이지만 실제로는 **React 엘리먼트**(JavaScript 객체)이며, React가 이것을 최종적으로 실제 HTML DOM으로 렌더링합니다.

```tsx
function Card() {
  const title = "점심 메뉴 고르기";

  return (
    <div className="card">              {/* class 대신 className 사용 */}
      <h2>{title}</h2>                   {/* {} 안에 JavaScript 표현식 사용 */}
      <button onClick={() => alert("클릭!")}>선택</button>
    </div>
  );
}
```

| HTML | JSX | 이유 |
|------|-----|------|
| `class` | `className` | `class`는 JavaScript 예약어 |
| `for` | `htmlFor` | `for`는 JavaScript 예약어 |
| `onclick` | `onClick` | 카멜 케이스 사용 |
| 닫는 태그 필수 아님 | 항상 필수 | `<img />`, `<br />` |

## State

State는 **컴포넌트 내부에서 관리하는 데이터**입니다. State가 변경되면 컴포넌트가 자동으로 다시 렌더링됩니다.

```tsx
import { useState } from 'react';

function Counter() {
  // useState(0)은 [현재값, 변경함수] 배열을 반환
  // const [count, setCount]는 이 배열을 두 변수로 나눠 받는 문법 (구조 분해 할당)
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>클릭 횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

`setCount`가 호출되면 → `count`가 변경되고 → 컴포넌트가 리렌더링되어 → 화면에 새 값이 표시됩니다.

## Props

React의 모든 컴포넌트는 **트리(계층) 구조**로 이루어지며, 데이터는 Props를 통해 **부모에서 자식으로** 전달됩니다.

![Props 데이터 흐름](/images/react-props-flow.svg)

Props는 **부모 컴포넌트가 자식 컴포넌트에 전달하는 데이터**입니다. 함수의 매개변수와 같은 개념입니다.

```tsx
// 부모 컴포넌트 - Props를 전달
function App() {
  return (
    <Card title="점심 메뉴 고르기" optionA="짜장면" optionB="짬뽕" />
  );
}

// 자식 컴포넌트 - Props를 받아서 사용
interface CardProps {  // TypeScript에서 객체의 타입(구조)을 정의하는 문법
  title: string;
  optionA: string;
  optionB: string;
}

function Card({ title, optionA, optionB }: CardProps) {
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

### Props vs State

| | Props | State |
|---|---|---|
| 데이터 소유 | 부모 컴포넌트 | 컴포넌트 자신 |
| 수정 가능 | 불가 (읽기 전용) | 가능 (setState) |
| 변경 시 | 부모가 변경하면 자식도 리렌더링 | 자신이 리렌더링 |

## 이벤트와 State의 순환

부모의 State를 자식에서 변경하려면, **부모가 setState 함수를 Props로 전달**합니다.

```tsx
import { useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      {/* setState 함수를 Props로 자식에 전달 */}
      <Child onIncrement={() => setCount(count + 1)} />
    </div>
  );
}

function Child({ onIncrement }: { onIncrement: () => void }) {
  return (
    // 자식에서 버튼 클릭 → 부모의 setState 호출 → 부모 State 변경 → 리렌더링
    <button onClick={onIncrement}>+1</button>
  );
}
```

이것이 React의 **단방향 데이터 흐름**입니다:

- 데이터(Props)는 **위에서 아래로** 흐름
- 이벤트는 **아래에서 위로** 흐름 (콜백 함수를 통해)

## 리스트 렌더링과 key

밸런스 게임의 게임 목록처럼, 배열 데이터를 화면에 표시하는 일은 매우 자주 있습니다. React에서는 `map()`을 사용합니다.

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

### 왜 key가 필요한가?

React는 기본적으로 **위치(순서)**를 기준으로 요소를 구분합니다. 고정된 요소는 위치가 변하지 않으므로 문제가 없습니다.

```tsx
// 고정 요소 - 위치로 구분 가능
<div>
  <Header />     {/* 항상 위치 0 */}
  <Content />    {/* 항상 위치 1 */}
</div>
```

하지만 리스트는 항목이 추가/삭제/재정렬될 수 있어서 **위치만으로 구분할 수 없습니다.**

```
목록에서 B를 삭제하면:

Before: [A, B, C]  → 위치 0, 1, 2
After:  [A, C]     → 위치 0, 1

위치 기준: "1번이 B에서 C로 바뀌었고, 2번이 삭제됨" (잘못된 판단)
key 기준: "B가 삭제됨" (정확한 판단)
```

`key`를 부여하면 React가 위치가 아닌 **key 값으로 항목을 추적**할 수 있어, 변경된 부분만 정확하게 업데이트합니다.

> key는 **같은 리스트 내에서만 유니크**하면 됩니다. 다른 리스트와 key가 겹쳐도 문제없습니다. React는 같은 부모 아래의 형제 요소들 사이에서만 key를 비교합니다.

> **고유한 id**를 key로 사용하세요. 배열 index는 항목이 재정렬되면 위치 기반과 같은 문제가 발생하므로 권장하지 않습니다.
