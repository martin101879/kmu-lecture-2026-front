# 밸런스 게임 화면 만들기

밸런스 게임의 UI 컴포넌트를 만듭니다. 우선 **목(mock) 데이터**로 화면이 동작하는 것을 확인하고, API 연동은 다음 단계에서 진행합니다.

1. **컴포넌트 구조 확인** - 어떤 컴포넌트를 만들지 정리
2. **타입 정의** - 데이터 타입
3. **ResultBar** - 투표 결과 프로그레스바
4. **GameCard** - 게임 카드 (선택지 + 결과)
5. **GameForm** - 게임 생성 폼
6. **GameList** - 게임 목록
7. **App 통합** - 전체 조립 + 목 데이터
8. **동작 확인** - 목 데이터로 UI 동작 확인

---

## 1. 컴포넌트 구조 확인

밸런스 게임 화면은 아래 컴포넌트로 구성됩니다.

```
App
├── GameForm          ← 게임 생성 폼 (주제, 선택지 A/B)
└── GameList          ← 게임 목록
    └── GameCard      ← 개별 게임 카드 (반복)
        ├── 선택지 A / VS / 선택지 B
        └── ResultBar ← 투표 결과 프로그레스바
```

### 완성 후 파일 구조

```
src/
├── main.tsx
├── App.tsx
├── App.module.css
├── types/
│   └── game.ts
└── components/
    ├── ResultBar.tsx
    ├── ResultBar.module.css
    ├── GameCard.tsx
    ├── GameCard.module.css
    ├── GameForm.tsx
    ├── GameForm.module.css
    ├── GameList.tsx
    └── GameList.module.css
```

---

## 2. 타입 정의

데이터의 TypeScript 타입을 정의합니다.

```tsx
// src/types/game.ts

export interface Game {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
}
```

---

## 3. ResultBar 컴포넌트

투표 결과를 프로그레스바로 표시하는 컴포넌트입니다.

```css
/* src/components/ResultBar.module.css */
.container {
  margin-top: 12px;
}

.bar {
  display: flex;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
}

.optionA {
  background: #3182f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: width 0.4s ease;
}

.optionB {
  background: #f04452;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: width 0.4s ease;
}

.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #8b95a1;
}

.total {
  text-align: center;
  margin-top: 4px;
  font-size: 12px;
  color: #8b95a1;
}
```

```tsx
// src/components/ResultBar.tsx

import styles from './ResultBar.module.css';

interface ResultBarProps {
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
}

function ResultBar({ optionA, optionB, countA, countB }: ResultBarProps) {
  const total = countA + countB;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div className={styles.optionA} style={{ width: `${pctA}%` }}>{pctA}%</div>
        <div className={styles.optionB} style={{ width: `${pctB}%` }}>{pctB}%</div>
      </div>
      <div className={styles.labels}>
        <span>{optionA}</span>
        <span>{optionB}</span>
      </div>
      <div className={styles.total}>{total}명 참여</div>
    </div>
  );
}

export default ResultBar;
```

---

## 4. GameCard 컴포넌트

개별 게임 카드입니다. 선택지를 클릭하면 투표하고 결과를 표시합니다.

```css
/* src/components/GameCard.module.css */
.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  padding: 20px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #4e5968;
  margin-bottom: 16px;
}

.options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.optionA, .optionB {
  flex: 1;
  padding: 24px 16px;
  border-radius: 10px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.optionA {
  background: #EBF4FF;
  color: #3182f6;
}

.optionA:hover {
  border-color: #3182f6;
}

.optionB {
  background: #FFF0F0;
  color: #f04452;
}

.optionB:hover {
  border-color: #f04452;
}

.vs {
  font-size: 12px;
  font-weight: 800;
  background: #191f28;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

```tsx
// src/components/GameCard.tsx

import { useState } from 'react';
import type { Game } from '../types/game';
import ResultBar from './ResultBar';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

function GameCard({ game }: GameCardProps) {
  const [countA, setCountA] = useState(game.countA);
  const [countB, setCountB] = useState(game.countB);
  const [voted, setVoted] = useState(false);

  // 투표 처리 (목 데이터 - 로컬에서만 카운트 증가)
  const handleVote = (choice: string) => {
    if (voted) return;

    if (choice === 'A') {
      setCountA(countA + 1);
    } else {
      setCountB(countB + 1);
    }
    setVoted(true);
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>{game.title}</div>
      <div className={styles.options}>
        <button className={styles.optionA} onClick={() => handleVote('A')}>
          {game.optionA}
        </button>
        <div className={styles.vs}>VS</div>
        <button className={styles.optionB} onClick={() => handleVote('B')}>
          {game.optionB}
        </button>
      </div>

      {voted && (
        <ResultBar
          optionA={game.optionA}
          optionB={game.optionB}
          countA={countA}
          countB={countB}
        />
      )}
    </div>
  );
}

export default GameCard;
```

> 현재는 투표 시 **로컬 State만 변경**합니다. API 연동 단계에서 백엔드와 연결합니다.

---

## 5. GameForm 컴포넌트

새 게임을 생성하는 폼입니다.

```css
/* src/components/GameForm.module.css */
.form {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  padding: 20px;
}

.formTitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.field {
  margin-bottom: 12px;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
  margin-bottom: 4px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e8eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.input:focus {
  border-color: #3182f6;
}

.row {
  display: flex;
  gap: 12px;
}

.row .field {
  flex: 1;
}

.button {
  width: 100%;
  padding: 12px;
  background: #3182f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.button:hover {
  background: #1b6ae0;
}
```

```tsx
// src/components/GameForm.tsx

import { useState } from 'react';
import type { Game } from '../types/game';
import styles from './GameForm.module.css';

interface GameFormProps {
  onGameCreated: (game: Game) => void;  // 게임 생성 후 부모에게 알림
}

function GameForm({ onGameCreated }: GameFormProps) {
  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  const handleSubmit = () => {
    if (!title || !optionA || !optionB) return;

    // 목 데이터 - 임시 id 생성
    const game: Game = {
      id: Date.now(),
      title,
      optionA,
      optionB,
      countA: 0,
      countB: 0,
    };

    onGameCreated(game);

    // 입력 초기화
    setTitle('');
    setOptionA('');
    setOptionB('');
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>새 게임 만들기</h2>
      <div className={styles.field}>
        <label className={styles.label}>주제</label>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오늘 점심 뭐 먹지?"
        />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>선택지 A</label>
          <input
            className={styles.input}
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="짜장면"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>선택지 B</label>
          <input
            className={styles.input}
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="짬뽕"
          />
        </div>
      </div>
      <button className={styles.button} onClick={handleSubmit}>
        게임 만들기
      </button>
    </div>
  );
}

export default GameForm;
```

> `onGameCreated` Props로 부모에게 이벤트를 전달합니다. 핵심 구조에서 배운 **이벤트와 State의 순환** 패턴입니다.

---

## 6. GameList 컴포넌트

게임 목록을 표시합니다.

```css
/* src/components/GameList.module.css */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

```tsx
// src/components/GameList.tsx

import type { Game } from '../types/game';
import GameCard from './GameCard';
import styles from './GameList.module.css';

interface GameListProps {
  games: Game[];
}

function GameList({ games }: GameListProps) {
  return (
    <div className={styles.list}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

export default GameList;
```

---

## 7. App 통합

모든 컴포넌트를 조합합니다. **목 데이터**로 초기 게임 목록을 제공합니다.

```css
/* src/App.module.css */
.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #8b95a1;
  margin-top: 4px;
}

.section {
  margin-bottom: 24px;
}
```

```tsx
// src/App.tsx

import { useState } from 'react';
import type { Game } from './types/game';
import GameList from './components/GameList';
import GameForm from './components/GameForm';
import styles from './App.module.css';

// 목 데이터 - API 연동 전까지 사용
const MOCK_GAMES: Game[] = [
  { id: 1, title: "점심 메뉴 고르기", optionA: "짜장면", optionB: "짬뽕", countA: 127, countB: 98 },
  { id: 2, title: "여행 스타일", optionA: "계획 여행", optionB: "즉흥 여행", countA: 84, countB: 156 },
  { id: 3, title: "개발할 때", optionA: "다크 모드", optionB: "라이트 모드", countA: 203, countB: 41 },
];

function App() {
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);

  // 게임 생성 후 목록 맨 앞에 추가
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

### 데이터 흐름 정리

```
App (games State + MOCK_GAMES)
  ├── GameList ← games를 Props로 전달
  │   └── GameCard ← 개별 game을 Props로 전달
  │       └── ResultBar ← 투표 결과를 Props로 전달
  └── GameForm ← onGameCreated 콜백을 Props로 전달
                   → 게임 생성 시 App의 setState 호출
```

---

## 8. 동작 확인

개발 서버를 실행합니다.

```bash
npm run dev
```

`http://localhost:5173`에 접속하여 확인합니다.

- 목 데이터로 게임 3개가 표시되는지 확인
- 선택지를 클릭하면 투표 결과 프로그레스바가 나타나는지 확인
- "새 게임 만들기" 폼에서 게임을 생성하면 목록 맨 앞에 추가되는지 확인

> 현재는 목 데이터로 동작합니다. 다음 단계 **API 연동**에서 백엔드와 연결합니다.
