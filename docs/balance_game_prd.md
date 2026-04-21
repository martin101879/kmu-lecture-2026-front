# 밸런스 게임 - PRD (Product Requirements Document)

## 1. 개요

### 1.1 목적

계명대학교 캡스톤 디자인 강의에서 사용할 **밸런스 게임** 웹 애플리케이션.
프론트엔드 ↔ 백엔드 ↔ DB의 전체 흐름을 학습하기 위한 교육용 프로젝트.

### 1.2 핵심 컨셉

두 가지 선택지 중 하나를 고르는 이지선다 게임.

- 게임 생성: 주제 + 선택지 A/B
- 게임 참여: A 또는 B 클릭
- 결과 확인: 비율 프로그레스바 + 참여자 수
- 댓글 작성: 닉네임 + 내용 (실습 기능)

### 1.3 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + TypeScript + Vite |
| Backend | Spring Boot 3.x + Java 21 |
| Database | MySQL 8.x (RDS) |
| Infra | AWS (S3, CloudFront, ALB, EC2, RDS) |
| CI/CD | GitHub Actions |

### 1.4 데모

`/demo-balance.html` 에서 프론트엔드 데모 확인 가능

---

## 2. 화면 구성

데모 기준 단일 페이지 구성.

### 2.1 레이아웃

```
┌─────────────────────────────────────┐
│         밸런스 게임                    │
│         당신의 선택은?                 │
├─────────────────────────────────────┤
│  진행 중인 게임                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  점심 메뉴 고르기              │    │
│  │  [짜장면]   VS   [짬뽕]      │    │
│  │  ████████░░░░  56% vs 44%  │    │  ← 선택 후 표시
│  │  127명 참여                   │    │
│  │  ─────────────────────────  │    │
│  │  댓글 3개                     │    │  ← 실습 기능
│  │  😀 김민수 [짜장면]            │    │
│  │    짜장면은 실패가 없다         │    │
│  │  [닉네임] [댓글 입력] [등록]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  새 게임 만들기                │    │
│  │  주제: [________________]    │    │
│  │  A: [________] B: [________]│    │
│  │  [게임 만들기]                 │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 2.2 게임 카드 상세

#### 선택 전

- 주제 타이틀
- 선택지 A (파란색 카드) / VS 뱃지 / 선택지 B (빨간색 카드)
- hover 시 border + shadow 효과

#### 선택 후

- 선택한 카드에 selected 스타일 적용
- 결과 프로그레스바 표시 (파란색 A% / 빨간색 B%)
- 선택지 이름 + 참여자 수
- 댓글 영역 표시 (실습)

---

## 3. API 목록

### 3.1 베이스 API (사전 제공)

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/games` | 게임 목록 조회 (최신순) |
| `POST` | `/api/games` | 게임 생성 |
| `POST` | `/api/games/{gameId}/vote` | 게임 참여 (A 또는 B 선택) |

### 3.2 실습 API (학생 구현)

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/games/{gameId}/comments` | 댓글 목록 조회 (최신순) |
| `POST` | `/api/games/{gameId}/comments` | 댓글 작성 |

---

## 4. API 상세

### 4.1 게임 목록 조회

```
GET /api/games
```

Response `200`:
```json
[
  {
    "id": 1,
    "title": "점심 메뉴 고르기",
    "optionA": "짜장면",
    "optionB": "짬뽕",
    "countA": 127,
    "countB": 98,
    "createdAt": "2026-04-21T14:00:00"
  }
]
```

### 4.2 게임 생성

```
POST /api/games
Content-Type: application/json
```

Request:
```json
{
  "title": "점심 메뉴 고르기",
  "optionA": "짜장면",
  "optionB": "짬뽕"
}
```

Response `201`:
```json
{
  "id": 1,
  "title": "점심 메뉴 고르기",
  "optionA": "짜장면",
  "optionB": "짬뽕",
  "countA": 0,
  "countB": 0,
  "createdAt": "2026-04-21T14:00:00"
}
```

### 4.3 게임 참여

```
POST /api/games/{gameId}/vote
Content-Type: application/json
```

Request:
```json
{
  "choice": "A"
}
```

Response `200`:
```json
{
  "countA": 128,
  "countB": 98
}
```

### 4.4 댓글 목록 조회 (실습)

```
GET /api/games/{gameId}/comments
```

Response `200`:
```json
[
  {
    "id": 1,
    "author": "김민수",
    "choice": "A",
    "content": "짜장면은 실패가 없다",
    "createdAt": "2026-04-21T14:05:00"
  }
]
```

### 4.5 댓글 작성 (실습)

```
POST /api/games/{gameId}/comments
Content-Type: application/json
```

Request:
```json
{
  "author": "김민수",
  "choice": "A",
  "content": "짜장면은 실패가 없다"
}
```

Response `201`:
```json
{
  "id": 1,
  "author": "김민수",
  "choice": "A",
  "content": "짜장면은 실패가 없다",
  "createdAt": "2026-04-21T14:05:00"
}
```

---

## 5. 데이터 모델

### 5.1 ERD

```
┌─────────────┐       ┌─────────────┐
│    game      │       │   comment   │
├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │
│ title       │  │    │ game_id (FK)│
│ option_a    │  └───>│ author      │
│ option_b    │       │ choice      │
│ count_a     │       │ content     │
│ count_b     │       │ created_at  │
│ created_at  │       └─────────────┘
└─────────────┘
```

### 5.2 테이블 정의

#### game (베이스)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| title | VARCHAR(200) | NOT NULL | 게임 주제 |
| option_a | VARCHAR(100) | NOT NULL | 선택지 A |
| option_b | VARCHAR(100) | NOT NULL | 선택지 B |
| count_a | INT | DEFAULT 0 | A 선택 수 |
| count_b | INT | DEFAULT 0 | B 선택 수 |
| created_at | DATETIME | NOT NULL | 생성 시간 |

#### comment (실습)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| game_id | BIGINT | FK → game.id, NOT NULL | |
| author | VARCHAR(50) | DEFAULT '익명' | 작성자 닉네임 |
| choice | VARCHAR(1) | NOT NULL | "A" 또는 "B" |
| content | VARCHAR(500) | NOT NULL | 댓글 내용 |
| created_at | DATETIME | NOT NULL | 작성 시간 |

---

## 6. 프로젝트 구조

### 6.1 Frontend

```
src/
├── components/
│   ├── Header.tsx / Header.module.css
│   ├── GameList.tsx / GameList.module.css
│   ├── GameCard.tsx / GameCard.module.css
│   ├── GameForm.tsx / GameForm.module.css
│   ├── ResultBar.tsx / ResultBar.module.css
│   ├── CommentSection.tsx / CommentSection.module.css    # 실습
│   └── CommentItem.tsx / CommentItem.module.css          # 실습
├── api/
│   └── gameApi.ts
├── types/
│   └── game.ts
├── App.tsx / App.module.css
├── main.tsx
└── index.css
```

### 6.2 Backend

```
src/main/java/ac/kr/kmu/capstone/
├── CapstoneApplication.java
├── controller/
│   ├── GameController.java
│   └── CommentController.java          # 실습
├── service/
│   ├── GameService.java
│   └── CommentService.java             # 실습
├── repository/
│   ├── GameRepository.java
│   └── CommentRepository.java          # 실습
├── entity/
│   ├── Game.java
│   └── Comment.java                    # 실습
└── dto/
    ├── GameCreateRequest.java
    ├── GameResponse.java
    ├── VoteRequest.java
    ├── VoteResponse.java
    ├── CommentCreateRequest.java       # 실습
    └── CommentResponse.java            # 실습
```

---

## 7. 실습 범위

학생들이 직접 구현하는 항목:

### Backend

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `Comment.java` | Entity 생성 (id, gameId, author, choice, content, createdAt) |
| 2 | `CommentRepository.java` | JPA Repository 생성 |
| 3 | `CommentCreateRequest.java` | 요청 DTO 생성 |
| 4 | `CommentResponse.java` | 응답 DTO 생성 |
| 5 | `CommentService.java` | 목록 조회, 작성 로직 |
| 6 | `CommentController.java` | GET, POST API 엔드포인트 |

### Frontend

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `game.ts` | Comment 타입 정의 추가 |
| 2 | `gameApi.ts` | 댓글 조회/작성 API 함수 추가 |
| 3 | `CommentItem.tsx` | 개별 댓글 컴포넌트 (닉네임, 선택 태그, 내용) |
| 4 | `CommentSection.tsx` | 댓글 목록 + 입력 폼 컴포넌트 |
| 5 | `GameCard.tsx` | CommentSection 연동 |

---

## 8. 비기능 요구사항

- 중복 투표 방지: `localStorage` 기반 (인증 없음)
- 로그인 없이 누구나 게임 생성 / 참여 / 댓글 가능
- 댓글 닉네임 미입력 시 "익명"으로 표시
- 모바일 반응형 대응
