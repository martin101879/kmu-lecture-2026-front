# 밸런스 게임 화면 만들기

밸런스 게임의 UI 컴포넌트를 만듭니다. 우선 **목(mock) 데이터**로 화면이 동작하는 것을 확인하고, API 연동은 다음 단계에서 진행합니다.

1. **컴포넌트 구조 확인** - 어떤 컴포넌트를 만들지 정리
2. **타입 정의** - 데이터 타입
3. **App** - 전체 페이지 조립 + 목 데이터
4. **GameList** - 게임 목록
5. **GameCard** - 게임 카드 (선택지 + 투표 + 수정/삭제)
6. **ResultBar** - 투표 결과 프로그레스바
7. **GameForm** - 게임 생성 폼
8. **CSS 스타일링** - 모든 컴포넌트의 CSS Modules
9. **동작 확인** - 목 데이터로 UI 동작 확인

---

## 1. 컴포넌트 구조 확인

완성된 밸런스 게임 화면입니다. 각 영역이 어떤 컴포넌트에 해당하는지 확인합니다.

![밸런스 게임 컴포넌트 구조](/images/balance-game-components.svg)

각 색상이 하나의 컴포넌트에 해당합니다:

```
App                          ← 전체 페이지 (헤더 + 게임 목록 + 생성 폼)
├── GameList                 ← 게임 목록 영역
│   └── GameCard (반복)      ← 개별 게임 카드
│       ├── ⋮ 메뉴           ← 수정 / 삭제 드롭다운
│       ├── 선택지 A / VS / 선택지 B
│       └── ResultBar        ← 투표 결과 프로그레스바
└── GameForm                 ← "새 게임 만들기" 폼
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
    ├── GameList.tsx
    ├── GameList.module.css
    ├── GameCard.tsx
    ├── GameCard.module.css
    ├── ResultBar.tsx
    ├── ResultBar.module.css
    ├── GameForm.tsx
    └── GameForm.module.css
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
  createdAt: string;
}
```

---

## 3. App

최상위 컴포넌트입니다. **목 데이터**로 게임 목록을 관리하고, GameList와 GameForm을 조합합니다.

```tsx
// src/App.tsx

import { useState } from 'react';
import type { Game } from './types/game';
import GameList from './components/GameList';
import GameForm from './components/GameForm';
import styles from './App.module.css';

// 목 데이터 - API 연동 전까지 사용
const MOCK_GAMES: Game[] = [
  { id: 1, title: "점심 메뉴 고르기", optionA: "짜장면", optionB: "짬뽕", countA: 127, countB: 98, createdAt: "" },
  { id: 2, title: "여행 스타일", optionA: "계획 여행", optionB: "즉흥 여행", countA: 84, countB: 156, createdAt: "" },
  { id: 3, title: "개발할 때", optionA: "다크 모드", optionB: "라이트 모드", countA: 203, countB: 41, createdAt: "" },
];

function App() {
  // ─── State ───
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);

  // ─── 이벤트 핸들러 ───
  const handleGameCreated = (game: Game) => {
    setGames([game, ...games]);                                    // 목록 맨 앞에 추가
  };

  const handleGameUpdated = (updated: Game) => {
    setGames(games.map((g) => (g.id === updated.id ? updated : g))); // 해당 게임만 교체
  };

  const handleGameDeleted = (gameId: number) => {
    setGames(games.filter((g) => g.id !== gameId));                // 해당 게임 제거
  };

  // ─── 렌더링 ───
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>밸런스 게임</h1>
        <p className={styles.subtitle}>당신의 선택은?</p>
      </div>

      <div className={styles.section}>
        <GameList
          games={games}
          onGameUpdated={handleGameUpdated}
          onGameDeleted={handleGameDeleted}
        />
      </div>

      <GameForm onGameCreated={handleGameCreated} />
    </div>
  );
}

export default App;
```

> App이 `games` State를 소유하고, 콜백 함수를 Props로 자식에게 전달합니다. 핵심 구조에서 배운 **이벤트와 State의 순환** 패턴입니다.

---

## 4. GameList

게임 목록을 표시합니다. `games` 배열을 `map()`으로 순회하며 GameCard를 반복 렌더링합니다.

```tsx
// src/components/GameList.tsx

import type { Game } from '../types/game';
import GameCard from './GameCard';
import styles from './GameList.module.css';

interface GameListProps {
  games: Game[];
  onGameUpdated: (game: Game) => void;
  onGameDeleted: (gameId: number) => void;
}

function GameList({ games, onGameUpdated, onGameDeleted }: GameListProps) {
  return (
    <div className={styles.list}>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onGameUpdated={onGameUpdated}
          onGameDeleted={onGameDeleted}
        />
      ))}
    </div>
  );
}

export default GameList;
```

> `key={game.id}`로 각 항목을 식별합니다. 핵심 구조에서 배운 **리스트 렌더링과 key** 패턴입니다.

---

## 5. GameCard

개별 게임 카드입니다. 선택지를 클릭하면 투표하고 결과를 표시합니다. 우측 상단 ⋮ 메뉴로 수정/삭제할 수 있습니다.

```tsx
// src/components/GameCard.tsx

import { useState, useRef, useEffect } from 'react';
import type { Game } from '../types/game';
import ResultBar from './ResultBar';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  onGameUpdated: (game: Game) => void;
  onGameDeleted: (gameId: number) => void;
}

function GameCard({ game, onGameUpdated, onGameDeleted }: GameCardProps) {

  // ─── 투표 관련 State ───
  const [countA, setCountA] = useState(game.countA);
  const [countB, setCountB] = useState(game.countB);

  // ─── 메뉴 관련 State ───
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ─── 수정 관련 State ───
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(game.title);
  const [editOptionA, setEditOptionA] = useState(game.optionA);
  const [editOptionB, setEditOptionB] = useState(game.optionB);

  // ─── 메뉴 밖 클릭 시 닫기 ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // ─── 이벤트 핸들러 ───

  const handleVote = (choice: string) => {
    if (choice === 'A') {
      setCountA(countA + 1);
    } else {
      setCountB(countB + 1);
    }
  };

  const handleUpdate = () => {
    if (!editTitle || !editOptionA || !editOptionB) return;
    onGameUpdated({ ...game, title: editTitle, optionA: editOptionA, optionB: editOptionB });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    onGameDeleted(game.id);
  };

  // ─── 렌더링 ───

  return (
    <div className={styles.card}>

      {/* ⋮ 드롭다운 메뉴 */}
      <div className={styles.menuWrapper} ref={menuRef}>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
        {menuOpen && (
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem} onClick={() => { setEditing(true); setMenuOpen(false); }}>수정</button>
            <button className={`${styles.dropdownItem} ${styles.dropdownDelete}`} onClick={() => { setMenuOpen(false); handleDelete(); }}>삭제</button>
          </div>
        )}
      </div>

      {/* 수정 모드 / 게임 표시 모드 전환 */}
      {editing ? (
        // ── 수정 폼 ──
        <div className={styles.editForm}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>주제</label>
            <input className={styles.editInput} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>선택지 A</label>
              <input className={styles.editInput} value={editOptionA} onChange={(e) => setEditOptionA(e.target.value)} />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>선택지 B</label>
              <input className={styles.editInput} value={editOptionB} onChange={(e) => setEditOptionB(e.target.value)} />
            </div>
          </div>
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)}>취소</button>
            <button className={styles.saveBtn} onClick={handleUpdate}>저장</button>
          </div>
        </div>
      ) : (
        // ── 게임 카드 (투표) ──
        <>
          <div className={styles.title}>{game.title}</div>
          <div className={styles.options}>
            <button className={styles.optionA} onClick={() => handleVote('A')}>{game.optionA}</button>
            <div className={styles.vs}>VS</div>
            <button className={styles.optionB} onClick={() => handleVote('B')}>{game.optionB}</button>
          </div>
          {(countA + countB) > 0 && (
            <ResultBar optionA={game.optionA} optionB={game.optionB} countA={countA} countB={countB} />
          )}
        </>
      )}
    </div>
  );
}

export default GameCard;
```

> 현재는 투표/수정/삭제 모두 **로컬 State만 변경**합니다. API 연동 단계에서 백엔드와 연결합니다.

---

## 6. ResultBar

투표 결과를 프로그레스바로 표시하는 컴포넌트입니다.

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
  // ─── 퍼센트 계산 ───
  const total = countA + countB;
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50;  // A의 퍼센트 (percent)
  const pctB = 100 - pctA;                                            // B의 퍼센트

  return (
    <div className={styles.container}>
      {/* 프로그레스바 - 0%인 쪽은 숨김 */}
      <div className={styles.bar}>
        {pctA > 0 && (
          <div className={styles.optionA} style={{ width: `${pctA}%` }}>{pctA}%</div>
        )}
        {pctB > 0 && (
          <div className={styles.optionB} style={{ width: `${pctB}%` }}>{pctB}%</div>
        )}
      </div>
      {/* 선택지 이름 */}
      <div className={styles.labels}>
        <span>{optionA}</span>
        <span>{optionB}</span>
      </div>
      {/* 참여자 수 */}
      <div className={styles.total}>{total}명 참여</div>
    </div>
  );
}

export default ResultBar;
```

---

## 7. GameForm

새 게임을 생성하는 폼입니다.

```tsx
// src/components/GameForm.tsx

import { useState } from 'react';
import type { Game } from '../types/game';
import styles from './GameForm.module.css';

interface GameFormProps {
  onGameCreated: (game: Game) => void;
}

function GameForm({ onGameCreated }: GameFormProps) {
  // ─── 입력 State ───
  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  // ─── 이벤트 핸들러 ───
  const handleSubmit = () => {
    if (!title || !optionA || !optionB) return;  // 빈 값 방지

    // 목 데이터 - 임시 id 생성
    const game: Game = {
      id: Date.now(),
      title,
      optionA,
      optionB,
      countA: 0,
      countB: 0,
      createdAt: "",
    };

    onGameCreated(game);  // 부모(App)에게 새 게임 전달

    // 입력 초기화
    setTitle('');
    setOptionA('');
    setOptionB('');
  };

  // ─── 렌더링 ───
  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>새 게임 만들기</h2>

      {/* 주제 입력 */}
      <div className={styles.field}>
        <label className={styles.label}>주제</label>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오늘 점심 뭐 먹지?"
        />
      </div>

      {/* 선택지 A / B 입력 */}
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

      {/* 제출 버튼 */}
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

## 8. CSS 스타일링

각 컴포넌트의 CSS Modules 파일을 작성합니다.

### App.module.css

```css
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  text-align: center;
  padding: 16px 24px;
  margin-bottom: 24px;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #8b95a1;
  margin-top: 4px;
}

.section {
  margin-bottom: 24px;
}
```

### GameList.module.css

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

### GameCard.module.css

```css
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  padding: 24px;
  position: relative;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.menuWrapper { position: absolute; top: 12px; right: 12px; }

.menuBtn {
  width: 28px; height: 28px; border: none; background: none;
  font-size: 18px; color: #8b95a1; cursor: pointer;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
}
.menuBtn:hover { background: #f2f4f6; color: #4e5968; }

.dropdown {
  position: absolute; top: 32px; right: 0; background: #fff;
  border: 1px solid #e5e8eb; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; min-width: 80px;
}
.dropdownItem {
  display: block; width: 100%; padding: 8px 16px; border: none; background: none;
  font-size: 13px; font-family: inherit; color: #191f28; cursor: pointer; text-align: left;
}
.dropdownItem:hover { background: #f2f4f6; }
.dropdownDelete { color: #f04452; }
.dropdownDelete:hover { background: #fff0f0; }

.editForm { display: flex; flex-direction: column; gap: 14px; }
.editField { display: flex; flex-direction: column; }
.editLabel { font-size: 13px; font-weight: 600; color: #4e5968; margin-bottom: 4px; }
.editRow { display: flex; gap: 12px; }
.editRow .editField { flex: 1; }
.editInput {
  width: 100%; padding: 10px 14px; border: 1px solid #e5e8eb;
  border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box;
}
.editInput:focus { border-color: #3182f6; }
.editActions { display: flex; gap: 8px; justify-content: flex-end; }
.saveBtn {
  padding: 8px 16px; background: #3182f6; color: #fff; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
}
.cancelBtn {
  padding: 8px 16px; background: #f2f4f6; color: #4e5968; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
}

.title { font-size: 16px; font-weight: 600; text-align: center; color: #4e5968; margin-bottom: 16px; }

.options { display: flex; align-items: center; gap: 12px; }
.optionA, .optionB {
  flex: 1; padding: 28px 16px; border-radius: 12px; text-align: center;
  font-size: 18px; font-weight: 700; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
}
.optionA { background: #EBF4FF; color: #3182f6; }
.optionA:hover { border-color: #3182f6; box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2); }
.optionB { background: #FFF0F0; color: #f04452; }
.optionB:hover { border-color: #f04452; box-shadow: 0 4px 12px rgba(240, 68, 82, 0.2); }

.vs {
  font-size: 12px; font-weight: 800; background: #191f28; color: #fff;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
```

### ResultBar.module.css

```css
.container { margin-top: 20px; }
.bar { display: flex; height: 36px; border-radius: 8px; overflow: hidden; }
.optionA {
  background: #3182f6; color: #fff; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 600; transition: width 0.6s ease;
}
.optionB {
  background: #f04452; color: #fff; display: flex; align-items: center;
  justify-content: center; font-size: 13px; font-weight: 600; transition: width 0.6s ease;
}
.labels { display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px; color: #8b95a1; }
.total { text-align: center; margin-top: 4px; font-size: 12px; color: #8b95a1; }
```

### GameForm.module.css

```css
.form { background: #fff; border-radius: 14px; border: 1px solid #e5e8eb; padding: 24px; }
.formTitle { font-size: 16px; font-weight: 600; margin-bottom: 14px; }
.field { margin-bottom: 14px; }
.label { display: block; font-size: 13px; font-weight: 600; color: #4e5968; margin-bottom: 4px; }
.input {
  width: 100%; padding: 10px 14px; border: 1px solid #e5e8eb;
  border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box;
}
.input:focus { border-color: #3182f6; }
.row { display: flex; gap: 12px; }
.row .field { flex: 1; }
.button {
  width: 100%; padding: 12px; background: #3182f6; color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
}
.button:hover { background: #1b6ae0; }
```

---

## 9. 동작 확인

개발 서버를 실행합니다.

```bash
npm run dev
```

`http://localhost:5173`에 접속하여 확인합니다.

- 목 데이터로 게임 3개가 표시되는지 확인
- 선택지를 클릭하면 투표 결과 프로그레스바가 나타나는지 확인
- ⋮ 메뉴에서 수정/삭제가 동작하는지 확인
- "새 게임 만들기" 폼에서 게임을 생성하면 목록 맨 앞에 추가되는지 확인

### 데이터 흐름 정리

```
App (games State + MOCK_GAMES)
  ├── GameList ← games + onGameUpdated + onGameDeleted를 Props로 전달
  │   └── GameCard ← 개별 game + 콜백을 Props로 전달
  │       └── ResultBar ← 투표 결과를 Props로 전달
  └── GameForm ← onGameCreated 콜백을 Props로 전달
```

> 현재는 목 데이터로 동작합니다. 다음 단계 **API 연동**에서 백엔드와 연결합니다.
