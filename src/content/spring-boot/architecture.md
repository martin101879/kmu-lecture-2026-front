# 핵심 구조

## 주요 컴포넌트

Spring Boot 애플리케이션은 역할에 따라 **Controller, Service, Repository** 3가지 컴포넌트로 나뉩니다. 각 컴포넌트는 고유한 책임을 가지며, 이 역할 분리는 어떤 아키텍처를 사용하든 동일하게 적용됩니다.

![Spring Boot 컴포넌트 구조](/images/spring-components.svg)

### Controller

**역할**: HTTP 요청을 받고, 응답을 반환하는 진입점

- 어떤 URL에 어떤 메서드를 연결할지 정의
- 비즈니스 로직을 직접 처리하지 않고 Service에 위임
- HTTP와 JSON 변환만 담당

```java
@RestController
@RequestMapping("/api/games")
public class GameController {

    @GetMapping
    public List<GameResponse> getGames() {
        // 게임 목록 반환
    }
}
```

### Service

**역할**: 비즈니스 로직을 처리하는 핵심 컴포넌트

- HTTP나 DB 기술에 의존하지 않는 순수한 로직
- 데이터 가공, 유효성 검증, 비즈니스 규칙 적용
- Controller와 Repository 사이를 연결

```java
@Service
public class GameService {

    public List<GameResponse> findAll() {
        // 게임 목록 조회 로직
    }
}
```

### Repository

**역할**: 데이터베이스 접근을 담당

- DB 종류나 SQL을 캡슐화
- Spring Data JPA를 사용하면 인터페이스만 정의하면 기본 CRUD가 자동 생성

```java
public interface GameRepository extends JpaRepository<Game, Long> {
    // 기본 CRUD 메서드가 자동 제공됨
}
```

### 왜 역할을 분리하는가?

각 컴포넌트가 자신의 책임에만 집중하면:

- Controller가 직접 DB를 조회하지 않음 → API 형태가 바뀌어도 비즈니스 로직에 영향 없음
- Service가 HTTP를 몰라도 됨 → 같은 로직을 API, 배치, 메시지 큐에서 재사용 가능
- Repository가 SQL을 캡슐화 → DB를 변경해도 Service 코드는 그대로

## 데이터 모델

애플리케이션에서 데이터를 다루는 클래스는 크게 **Entity**와 **DTO** 두 가지로 나뉩니다. 각각 역할이 다르기 때문에 분리해서 관리합니다.

### Entity - 데이터가 저장되는 형태

데이터베이스 테이블과 1:1로 매핑되는 클래스입니다.

```java
@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String optionA;
    private String optionB;
}
```

### DTO - 데이터가 전달되는 형태

클라이언트와 데이터를 주고받을 때 사용하는 객체입니다. 요청(Request)과 응답(Response)을 각각 정의합니다.

```java
// 클라이언트 → 서버 (요청)
public record GameCreateRequest(String title, String optionA, String optionB) {}

// 서버 → 클라이언트 (응답)
public record GameResponse(Long id, String title, String optionA, String optionB, int countA, int countB) {}
```

### 왜 Entity와 DTO를 분리하는가?

Entity를 클라이언트에 직접 노출하지 않고 DTO를 사용하는 것이 실무 관례입니다.

- **Entity**는 DB 구조에 종속 → 테이블이 변경되면 API 응답도 변경됨
- **DTO**로 분리하면 → DB 구조가 바뀌어도 API 응답은 유지 가능
- 클라이언트에 불필요한 필드 노출 방지 (보안)
- 요청/응답마다 필요한 필드만 선별하여 전달

## 아키텍처에 대하여

이 강의에서는 가장 기본적인 계층형 구조를 사용합니다. 실무에서는 프로젝트 규모와 복잡도에 따라 다른 아키텍처를 적용하기도 합니다.

| 아키텍처 | 특징 | 적합한 경우 |
|---------|------|------------|
| **계층형** (Package by Layer) | 역할별로 패키지 분리 | 소규모, 학습용 |
| **기능별** (Package by Feature) | 기능 단위로 관련 코드를 한 곳에 모음 | 중규모 이상 |
| **헥사고날** (Hexagonal) | 비즈니스 로직이 외부 기술에 의존하지 않도록 분리 | 복잡한 비즈니스 로직 |

### 계층형 (Package by Layer)

```
kr.ac.kmu.capstone/
├── controller/
│   ├── GameController.java
│   └── CommentController.java
├── service/
│   ├── GameService.java
│   └── CommentService.java
├── repository/
│   ├── GameRepository.java
│   └── CommentRepository.java
├── entity/
│   ├── Game.java
│   └── Comment.java
└── dto/
    ├── GameCreateRequest.java
    ├── GameResponse.java
    └── CommentResponse.java
```

### 기능별 (Package by Feature)

```
kr.ac.kmu.capstone/
├── game/
│   ├── GameController.java
│   ├── GameService.java
│   ├── GameRepository.java
│   ├── Game.java
│   ├── GameCreateRequest.java
│   └── GameResponse.java
└── comment/
    ├── CommentController.java
    ├── CommentService.java
    ├── CommentRepository.java
    ├── Comment.java
    └── CommentResponse.java
```

### 헥사고날 (Hexagonal)

```
kr.ac.kmu.capstone/
├── game/
│   ├── domain/
│   │   ├── Game.java           ← 도메인 모델 (외부 의존 없음)
│   │   └── GameRepository.java ← 포트 (인터페이스)
│   ├── application/
│   │   ├── GameService.java    ← 유스케이스
│   │   └── GameResponse.java   ← 응답 DTO
│   ├── controller/             ← 인바운드 어댑터
│   │   └── GameController.java
│   └── gateway/                ← 아웃바운드 어댑터
│       └── GameJpaRepository.java
└── comment/
    └── ...
```

어떤 아키텍처를 사용하든 **컴포넌트의 역할 분리**와 **데이터 모델의 정의**는 동일하게 적용됩니다.
