# API 연동

밸런스 게임 화면을 백엔드 API와 연결합니다. 목 데이터를 실제 API 호출로 교체합니다.

1. **CORS 설정** - 백엔드에서 프론트엔드 요청 허용
2. **API 함수 작성** - 백엔드 API 호출 함수
3. **타입 보강** - API 요청/응답 타입 추가
4. **GameCard 수정** - 투표 시 API 호출
5. **GameForm 수정** - 게임 생성 시 API 호출
6. **App 수정** - 목 데이터 → API 호출 (useEffect)
7. **동작 확인** - 백엔드와 연동 테스트

---

## 1. CORS 설정

프론트엔드(`localhost:5173`)에서 백엔드(`localhost:8080`)로 API를 호출하면 브라우저가 **CORS 정책**으로 차단합니다.

### CORS란?

브라우저는 보안을 위해 **다른 출처(Origin)**로의 요청을 기본적으로 차단합니다. 출처는 프로토콜 + 호스트 + 포트 조합으로 판단합니다.

```
http://localhost:5173  (프론트엔드)
http://localhost:8080  (백엔드)
                ^^^^
                포트가 다름 → 다른 Origin → CORS 차단
```

백엔드에서 "이 출처에서의 요청은 허용한다"고 설정해야 합니다.

### 백엔드에 CORS 설정 추가

먼저 `application.yml`에 허용할 출처를 정의합니다.

```yaml
# application.yml
app:
  cors:
    allowed-origins: http://localhost:5173
```

> 배포 시에는 실제 도메인으로 변경합니다.
> 예: `allowed-origins: https://web.honggildong.cecil1018.click`

설정 클래스에서 이 값을 읽어 CORS를 적용합니다.

```java
// src/main/java/kr/ac/kmu/capstone/balance_api/config/WebConfig.java

package kr.ac.kmu.capstone.balance_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")  // application.yml에서 값 주입
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

---

## 2. API 함수 작성

백엔드 API를 호출하는 함수를 모아둡니다. `src/api/` 폴더를 생성합니다.

Vite는 환경 변수를 `.env` 파일로 관리합니다. 프로젝트 루트에 `.env` 파일을 생성합니다.

```
# .env
VITE_API_BASE_URL=http://localhost:8080
```

> Vite에서 환경 변수는 반드시 `VITE_` 접두사가 있어야 클라이언트 코드에서 접근 가능합니다.

`.env` 파일의 값은 **빌드 시점에 코드에 삽입**됩니다. 환경별로 파일을 나눌 수 있습니다.

| 파일 | 적용 시점 |
|------|----------|
| `.env` | 기본값 (항상 적용) |
| `.env.development` | `npm run dev` 시 |
| `.env.production` | `npm run build` 시 |

```
# .env.development (로컬 개발)
VITE_API_BASE_URL=http://localhost:8080

# .env.production (배포)
VITE_API_BASE_URL=https://api.honggildong.cecil1018.click
```

빌드 명령어에서 직접 주입할 수도 있습니다.

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

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

---

## 3. 타입 보강

API 요청/응답에 필요한 타입을 추가합니다.

```tsx
// src/types/game.ts

export interface Game {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
  createdAt: string;      // 추가: API 응답에 포함
}

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

## 4. GameCard 수정

투표 시 로컬 State 변경 대신 **API를 호출**하도록 수정합니다.

```tsx
// src/components/GameCard.tsx - 변경 부분만 표시

import { vote } from '../api/gameApi';  // 추가

// handleVote 수정
const handleVote = async (choice: string) => {  // async 추가
  if (voted) return;

  const result = await vote(game.id, { choice });  // API 호출
  setCountA(result.countA);
  setCountB(result.countB);
  setVoted(true);
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

---

## 6. App 수정

목 데이터를 제거하고, **useEffect**로 API에서 게임 목록을 불러옵니다.

```tsx
// src/App.tsx

import { useState, useEffect } from 'react';      // useEffect 추가
import { fetchGames } from './api/gameApi';         // 추가
import type { Game } from './types/game';
import GameList from './components/GameList';
import GameForm from './components/GameForm';
import styles from './App.module.css';

// MOCK_GAMES 삭제

function App() {
  const [games, setGames] = useState<Game[]>([]);  // 빈 배열로 시작

  // 컴포넌트가 처음 렌더링될 때 게임 목록 조회
  useEffect(() => {
    fetchGames().then(setGames);
  }, []);

  const handleGameCreated = (game: Game) => {
    setGames([game, ...games]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>밸런스 게임</h1>
        <p className={styles.subtitle}>당신의 선택은?</p>
      </div>

      <div className={styles.section}>
        <GameList games={games} />
      </div>

      <GameForm onGameCreated={handleGameCreated} />
    </div>
  );
}

export default App;
```

### useEffect 동작

```tsx
useEffect(() => {
  fetchGames().then(setGames);  // API에서 게임 목록을 가져와 State에 저장
}, []);  // [] = 컴포넌트가 처음 렌더링될 때 한 번만 실행
```

| 의존성 배열 | 실행 시점 |
|-----------|----------|
| `[]` | 컴포넌트 마운트 시 **한 번만** 실행 |
| `[value]` | `value`가 변경될 때마다 실행 |
| 생략 | 매 렌더링마다 실행 (보통 사용하지 않음) |

### 변경 요약

| | 목 데이터 (이전) | API 연동 (이후) |
|---|---|---|
| 초기 데이터 | `MOCK_GAMES` 상수 | `useEffect` + `fetchGames()` |
| 게임 생성 | `Date.now()`로 임시 id | `createGame()` API 호출 |
| 투표 | 로컬 State만 변경 | `vote()` API 호출 |

---

## 7. 동작 확인

백엔드와 프론트엔드를 모두 실행합니다.

### 백엔드 실행

```bash
# balance-api 프로젝트에서
cd local-dev && docker compose up -d
cd .. && ./gradlew bootRun
```

### 프론트엔드 실행

```bash
# balance-web 프로젝트에서
npm run dev
```

### 테스트

1. `http://localhost:5173`에 접속
2. "새 게임 만들기" 폼에서 게임 생성 → DB에 저장되는지 확인
3. 선택지 A 또는 B를 클릭하여 투표 → 새로고침해도 결과가 유지되는지 확인
4. 여러 브라우저/탭에서 접속하여 같은 데이터가 보이는지 확인

> 목 데이터와의 차이: **새로고침해도 데이터가 유지됩니다.** 데이터가 브라우저 메모리가 아닌 서버(DB)에 저장되기 때문입니다.

> 강의 마지막에 **댓글 기능을 직접 추가하는 자율 실습**을 진행합니다.
