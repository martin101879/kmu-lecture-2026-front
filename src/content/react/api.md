# API 연동

밸런스 게임 화면을 백엔드 API와 연결합니다. 목 데이터를 실제 API 호출로 교체합니다.

1. **API 함수 작성** - 백엔드 API 호출 함수
2. **타입 보강** - API 요청/응답 타입 추가
3. **App 수정** - 목 데이터 → API 호출 (useEffect)
4. **GameCard 수정** - 투표/수정/삭제 시 API 호출
5. **GameForm 수정** - 게임 생성 시 API 호출
6. **동작 확인** - 백엔드와 연동 테스트

---

## 1. API 함수 작성

백엔드 API를 호출하는 함수를 모아둡니다. `src/api/` 폴더를 생성합니다.

Vite는 환경 변수를 `.env` 파일로 관리합니다. 프로젝트 루트에 `.env` 파일을 생성합니다.

```
# .env
VITE_API_BASE_URL=http://localhost:8080
```

> Vite에서 환경 변수는 반드시 `VITE_` 접두사가 있어야 클라이언트 코드에서 접근 가능합니다.

`.env` 파일의 값은 **빌드 시점에 코드에 삽입**됩니다.

```tsx
// src/api/gameApi.ts

import type { Game, GameCreateRequest, VoteRequest, VoteResponse } from '../types/game';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/games`;

// 게임 목록 조회
export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(API_BASE_URL);
  return res.json();
}

// 게임 생성
export async function createGame(request: GameCreateRequest): Promise<Game> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

// 게임 수정
export async function updateGame(gameId: number, request: GameCreateRequest): Promise<Game> {
  const res = await fetch(`${API_BASE_URL}/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

// 게임 삭제
export async function deleteGame(gameId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/${gameId}`, {
    method: 'DELETE',
  });
}

// 투표
export async function vote(gameId: number, request: VoteRequest): Promise<VoteResponse> {
  const res = await fetch(`${API_BASE_URL}/${gameId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}
```

> `fetch`는 브라우저 내장 API입니다. 별도 라이브러리 설치 없이 사용할 수 있습니다.
> 실무에서는 `axios` 같은 라이브러리를 사용하기도 하지만, fetch로 기본을 이해하면 axios도 쉽게 사용할 수 있습니다.

---

## 2. 타입 보강

`src/types/game.ts`에 API 요청/응답 타입을 추가합니다.

```tsx
// src/types/game.ts - 추가 부분

export interface GameCreateRequest {
  title: string;
  optionA: string;
  optionB: string;
}

export interface VoteRequest {
  choice: string;  /* "A" 또는 "B" */
}

export interface VoteResponse {
  countA: number;
  countB: number;
}
```

---

## 3. App 수정

목 데이터를 제거하고, **useEffect**로 API에서 게임 목록을 불러옵니다.

```tsx
// src/App.tsx - 변경 부분만 표시

import { useState, useEffect } from 'react';  // useEffect 추가
import { fetchGames } from './api/gameApi';     // 추가

// MOCK_GAMES 삭제

// State 변경: 빈 배열로 시작
const [games, setGames] = useState<Game[]>([]);

// useEffect 추가: 컴포넌트 마운트 시 API에서 게임 목록 조회
useEffect(() => {
  const loadGames = async () => {
    const data = await fetchGames();
    setGames(data);
  };
  loadGames();
}, []);
```

![useEffect 실행 흐름](/images/useeffect-lifecycle.svg)

### useEffect 동작

```tsx
useEffect(() => {
  const loadGames = async () => {
    const data = await fetchGames();  // API에서 게임 목록을 가져와
    setGames(data);                   // State에 저장
  };
  loadGames();
}, []);  // [] = 컴포넌트가 처음 렌더링될 때 한 번만 실행
```

> useEffect 콜백 자체는 `async`가 될 수 없으므로, 내부에 async 함수를 정의하고 호출합니다.

### 의존성 배열

| 의존성 배열 | 실행 시점 |
|-----------|----------|
| `[]` | 컴포넌트 마운트 시 **한 번만** 실행 |
| `[value]` | `value`가 변경될 때마다 실행 |
| 생략 | 매 렌더링마다 실행 (보통 사용하지 않음) |

### cleanup 함수 (반환값)

useEffect는 **cleanup 함수**를 반환할 수 있습니다. 컴포넌트가 언마운트되거나 리렌더링 직전에 실행되어 이벤트 리스너, 타이머 등을 정리합니다.

```tsx
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);

  // cleanup - 컴포넌트가 사라질 때 타이머 즉시 정리
  return () => clearInterval(timer);
}, []);
```

> cleanup은 **동기 함수**여야 합니다. 컴포넌트가 사라지는 시점에 즉시 정리되어야 하기 때문입니다.

---

## 4. GameCard 수정

투표/수정/삭제 시 로컬 State 변경 대신 **API를 호출**하도록 수정합니다.

```tsx
// src/components/GameCard.tsx - 변경 부분만 표시

import { vote, updateGame, deleteGame } from '../api/gameApi';  // 추가

// handleVote 수정
const handleVote = async (choice: string) => {  // async 추가
  const result = await vote(game.id, { choice });  // API 호출
  setCountA(result.countA);
  setCountB(result.countB);
};

// handleUpdate 수정
const handleUpdate = async () => {  // async 추가
  if (!editTitle || !editOptionA || !editOptionB) return;
  const updated = await updateGame(game.id, {  // API 호출
    title: editTitle, optionA: editOptionA, optionB: editOptionB,
  });
  onGameUpdated(updated);
  setEditing(false);
};

// handleDelete 수정
const handleDelete = async () => {  // async 추가
  if (!confirm('정말 삭제하시겠습니까?')) return;
  await deleteGame(game.id);  // API 호출
  onGameDeleted(game.id);
};
```

---

## 5. GameForm 수정

게임 생성 시 목 데이터 대신 **API를 호출**하도록 수정합니다.

```tsx
// src/components/GameForm.tsx - 변경 부분만 표시

import { createGame } from '../api/gameApi';  // 추가

// handleSubmit 수정
const handleSubmit = async () => {  // async 추가
  if (!title || !optionA || !optionB) return;

  const game = await createGame({ title, optionA, optionB });  // API 호출
  onGameCreated(game);

  setTitle('');
  setOptionA('');
  setOptionB('');
};
```

### 변경 요약

| | 목 데이터 (이전) | API 연동 (이후) |
|---|---|---|
| 초기 데이터 | `MOCK_GAMES` 상수 | `useEffect` + `fetchGames()` |
| 게임 생성 | `Date.now()`로 임시 id | `createGame()` API 호출 |
| 게임 수정 | 로컬 State만 변경 | `updateGame()` API 호출 |
| 게임 삭제 | 로컬 State만 변경 | `deleteGame()` API 호출 |
| 투표 | 로컬 State만 변경 | `vote()` API 호출 |

---

## 6. 동작 확인

백엔드와 프론트엔드를 모두 실행한 상태에서 확인합니다.

1. `http://localhost:5173`에 접속
2. 게임 목록이 표시되지 않음
3. 브라우저 개발자 도구(F12) → 콘솔 탭 확인

아래와 같은 에러가 표시됩니다.

```
Access to fetch at 'http://localhost:8080/api/games' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

코드는 정상이지만 **브라우저가 요청을 차단**하고 있습니다. 다음 단계 **CORS**에서 이 문제를 해결합니다.
