# 밸런스 게임 API 만들기

이제 본격적으로 밸런스 게임을 만들어봅니다. 아래 순서로 진행합니다.

### 개발 환경 준비

1. **Docker & MySQL 실행** - Docker Compose로 로컬 MySQL 실행

### API 개발

2. **의존성 추가** - build.gradle.kts에 DB 관련 라이브러리 추가
3. **application.yml 설정** - DB 연결 정보 설정
4. **API 목록 확인** - 어떤 API를 만들지 정리
5. **Entity** - DB 테이블과 매핑되는 클래스 작성
6. **Repository** - 데이터 접근 인터페이스 작성
7. **DTO** - 요청/응답 데이터 구조 정의
8. **Service** - 비즈니스 로직 작성
9. **Controller** - HTTP 엔드포인트 작성
10. **동작 확인** - API 테스트

---

## 1. Docker & MySQL 실행

앞서 첫 번째 API 실습에서는 Controller가 DTO를 직접 생성해서 반환했습니다. 하지만 실제 서비스에서는 게임 데이터, 투표 결과 등을 **영구적으로 저장하고 조회**해야 합니다. 서버를 재시작해도 데이터가 유지되어야 하기 때문입니다.

이를 위해 **Database**가 필요합니다.

```
첫 번째 API 실습:  Controller → DTO (데이터 저장 없음, 서버 종료 시 사라짐)
밸런스 게임:       Controller → Service → Repository → Database (영구 저장)
```

이 강의에서는 **MySQL**을 사용하며, Spring Data JPA를 통해 Java 코드로 DB를 다룹니다.

### Docker란?

MySQL을 사용하려면 내 PC에 설치해야 할까요? Docker를 사용하면 **설치 없이** 실행할 수 있습니다.

Docker는 애플리케이션을 **컨테이너**라는 격리된 환경에서 실행하는 도구입니다.

| 개념 | 설명 | 비유 |
|------|------|------|
| **이미지 (Image)** | 실행할 소프트웨어가 패키징된 파일 | 설치 파일 |
| **컨테이너 (Container)** | 이미지를 기반으로 만든 격리된 실행 환경 | 독립된 가상 PC |
| **이미지 저장소 (Registry)** | 이미지를 공유하는 원격 저장소 (Docker Hub, AWS ECR 등) | 앱 스토어 |

```
Docker Hub에서 mysql:8.0 이미지 다운로드
    ↓
이미지를 기반으로 컨테이너 생성
    ↓
컨테이너 안에서 MySQL이 실행됨 (내 PC에 직접 설치하지 않음)
```

**왜 Docker를 쓰는가?**

- 내 PC 환경을 오염시키지 않음 (삭제하면 깔끔하게 사라짐)
- 누구나 같은 환경에서 실행 가능 (OS, 버전 차이 없음)
- 명령어 한 줄로 실행/종료 가능

### Docker Compose

실제 서비스에서는 MySQL, Redis, Kafka 등 **여러 컨테이너를 함께** 실행해야 합니다. Docker Compose는 `docker-compose.yml` 파일 하나로 여러 컨테이너를 한 번에 관리합니다.

```
docker compose up -d     ← 파일에 정의된 모든 컨테이너 한 번에 시작
docker compose down      ← 한 번에 종료
```

### 로컬 개발용 MySQL (Docker Compose)

로컬에서 개발할 때는 Docker로 MySQL을 실행합니다. 프로젝트 루트에 `local-dev/docker-compose.yml` 파일을 생성합니다.

```
balance-api/
├── local-dev/
│   └── docker-compose.yml    ← 여기에 생성
├── build.gradle.kts
└── src/
```

```yaml
name: balance-api

services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: root1234
      MYSQL_DATABASE: balance        # 자동으로 생성할 데이터베이스 이름
      MYSQL_USER: balance            # 애플리케이션용 사용자
      MYSQL_PASSWORD: balance1234    # 애플리케이션용 비밀번호
    ports:
      - "3306:3306"                  # 호스트:컨테이너 포트 매핑
    volumes:
      - ./mysql-data:/var/lib/mysql  # 데이터 영속화 (컨테이너 삭제해도 데이터 유지)
```

실행 및 종료:

> **Docker Desktop**을 먼저 실행한 후 아래 명령어를 입력합니다. Docker Desktop이 실행되지 않은 상태에서는 명령어가 동작하지 않습니다.

```bash
# local-dev 디렉토리로 이동
cd local-dev

# MySQL 시작 (백그라운드)
docker compose up -d

# 상태 확인
docker compose ps

# MySQL 종료
docker compose down

# MySQL 종료 + 데이터 삭제
docker compose down -v
```

---

## 2. 의존성 추가

DB를 사용하기 위해 `build.gradle.kts`에 라이브러리를 추가합니다.

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")  // 추가
    runtimeOnly("com.mysql:mysql-connector-j")                               // 추가
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

> 의존성을 추가한 후 IDE에서 Gradle Sync를 실행합니다. (IntelliJ: 우측 상단 코끼리 아이콘 클릭)

---

## 3. application.yml 설정

DB 연결 설정을 `application.yml`에 추가합니다.

```yaml
# application.yml - 로컬 개발용
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/balance
    username: balance
    password: balance1234
  jpa:
    hibernate:
      ddl-auto: update
```

> `ddl-auto: update`는 Entity 클래스를 기반으로 테이블을 자동 생성/수정해줍니다. 개발 단계에서 편리하지만, 운영 환경에서는 사용하지 않습니다.

---

## 4. API 목록 확인

밸런스 게임의 백엔드 API입니다. 강의에서 함께 작성합니다.

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/games` | 게임 목록 조회 (최신순) |
| `POST` | `/api/games` | 게임 생성 |
| `PUT` | `/api/games/{gameId}` | 게임 수정 |
| `DELETE` | `/api/games/{gameId}` | 게임 삭제 |
| `POST` | `/api/games/{gameId}/vote` | 게임 참여 (A 또는 B 선택) |

### API 테스트 파일

코드를 모두 작성한 후 이 파일로 테스트합니다. `local-dev/api-test.http` 파일을 미리 생성해둡니다.

```http
### 게임 생성
POST http://localhost:8080/api/games
Content-Type: application/json

{
  "title": "점심 메뉴 고르기",
  "optionA": "짜장면",
  "optionB": "짬뽕"
}

### 게임 목록 조회
GET http://localhost:8080/api/games

### 게임 수정 (id=1)
PUT http://localhost:8080/api/games/1
Content-Type: application/json

{
  "title": "저녁 메뉴 고르기",
  "optionA": "치킨",
  "optionB": "피자"
}

### 게임 삭제 (id=1)
DELETE http://localhost:8080/api/games/1

### 투표 (id=1, A 선택)
POST http://localhost:8080/api/games/1/vote
Content-Type: application/json

{
  "choice": "A"
}
```

> VS Code에서 각 `###` 위에 나타나는 **Send Request**를 클릭하면 요청이 전송됩니다.
> 사전 준비에서 설치한 **REST Client** 확장이 필요합니다.

### 완성 후 프로젝트 구조

위 API들을 구현하면 아래와 같은 파일 구조가 됩니다.

```
src/main/java/kr/ac/kmu/capstone/balance_api/
├── BalanceApiApplication.java
├── controller/
│   ├── HealthController.java      ← 프로젝트 생성에서 작성
│   └── GameController.java
├── service/
│   └── GameService.java
├── repository/
│   └── GameRepository.java
├── entity/
│   └── Game.java
└── dto/
    ├── HealthResponse.java        ← 프로젝트 생성에서 작성
    ├── GameCreateRequest.java
    ├── GameUpdateRequest.java
    ├── GameResponse.java
    ├── VoteRequest.java
    └── VoteResponse.java
```

---

## 5. Entity

게임 데이터를 저장하는 테이블과 매핑되는 클래스입니다.

```java
package kr.ac.kmu.capstone.balance_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity // 이 클래스가 DB 테이블과 매핑됨을 선언
public class Game {

    @Id // 기본 키 (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;     // 게임 주제

    @Column(nullable = false, length = 100)
    private String optionA;   // 선택지 A

    @Column(nullable = false, length = 100)
    private String optionB;   // 선택지 B

    private int countA;       // A 선택 수
    private int countB;       // B 선택 수

    @Column(nullable = false)
    private LocalDateTime createdAt;  // 생성 시간

    // 기본 생성자 (JPA 필수)
    protected Game() {}

    public Game(String title, String optionA, String optionB) {
        this.title = title;
        this.optionA = optionA;
        this.optionB = optionB;
        this.countA = 0;
        this.countB = 0;
        this.createdAt = LocalDateTime.now();
    }

    // getter
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public int getCountA() { return countA; }
    public int getCountB() { return countB; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // 게임 수정
    public void update(String title, String optionA, String optionB) {
        this.title = title;
        this.optionA = optionA;
        this.optionB = optionB;
    }

    // 투표 메서드
    public void voteA() { this.countA++; }
    public void voteB() { this.countB++; }
}
```

---

## 6. Repository

```java
package kr.ac.kmu.capstone.balance_api.repository;

import kr.ac.kmu.capstone.balance_api.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {

    // 최신순 정렬 조회 - 메서드 이름 규칙으로 자동 쿼리 생성
    List<Game> findAllByOrderByCreatedAtDesc();
}
```

---

## 7. DTO

### 게임 생성 요청 - GameCreateRequest.java

```java
package kr.ac.kmu.capstone.balance_api.dto;

// 게임 생성 요청
public record GameCreateRequest(
    String title,
    String optionA,
    String optionB
) {}
```

### 게임 수정 요청 - GameUpdateRequest.java

```java
package kr.ac.kmu.capstone.balance_api.dto;

// 게임 수정 요청
public record GameUpdateRequest(
    String title,
    String optionA,
    String optionB
) {}
```

### 투표 요청 - VoteRequest.java

```java
package kr.ac.kmu.capstone.balance_api.dto;

// 투표 요청
public record VoteRequest(
    String choice  /* "A" 또는 "B" */
) {}
```

### 게임 응답 - GameResponse.java

```java
package kr.ac.kmu.capstone.balance_api.dto;

import kr.ac.kmu.capstone.balance_api.entity.Game;
import java.time.LocalDateTime;

public record GameResponse(
    Long id,
    String title,
    String optionA,
    String optionB,
    int countA,
    int countB,
    LocalDateTime createdAt
) {
    // Entity → DTO 변환 메서드
    public static GameResponse from(Game game) {
        return new GameResponse(
            game.getId(),
            game.getTitle(),
            game.getOptionA(),
            game.getOptionB(),
            game.getCountA(),
            game.getCountB(),
            game.getCreatedAt()
        );
    }
}
```

### 투표 결과 응답 - VoteResponse.java

```java
package kr.ac.kmu.capstone.balance_api.dto;

// 투표 결과 응답
public record VoteResponse(
    int countA,
    int countB
) {}
```

---

## 8. Service

비즈니스 로직을 처리합니다. Controller와 Repository 사이를 연결합니다.

```java
package kr.ac.kmu.capstone.balance_api.service;

import kr.ac.kmu.capstone.balance_api.dto.*;
import kr.ac.kmu.capstone.balance_api.entity.Game;
import kr.ac.kmu.capstone.balance_api.repository.GameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service // Spring이 관리하는 Service 컴포넌트
public class GameService {

    private final GameRepository gameRepository;

    // 생성자 주입 - Spring이 GameRepository를 자동으로 넣어줌 (DI)
    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // 게임 목록 조회 (최신순)
    public List<GameResponse> findAll() {
        return gameRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(GameResponse::from)  // Entity → DTO 변환
                .toList();
    }

    // 게임 생성
    @Transactional
    public GameResponse create(GameCreateRequest request) {
        Game game = new Game(
            request.title(),
            request.optionA(),
            request.optionB()
        );
        Game saved = gameRepository.save(game);  // DB에 저장
        return GameResponse.from(saved);
    }

    // 게임 수정
    @Transactional
    public GameResponse update(Long gameId, GameUpdateRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("게임을 찾을 수 없습니다."));

        game.update(request.title(), request.optionA(), request.optionB());
        return GameResponse.from(game);
    }

    // 게임 삭제
    @Transactional
    public void delete(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("게임을 찾을 수 없습니다."));

        gameRepository.delete(game);
    }

    // 투표
    @Transactional // DB 변경이 포함된 작업 - 실패 시 자동 롤백
    public VoteResponse vote(Long gameId, VoteRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("게임을 찾을 수 없습니다."));

        if ("A".equals(request.choice())) {
            game.voteA();
        } else {
            game.voteB();
        }

        return new VoteResponse(game.getCountA(), game.getCountB());
    }
}
```

---

## 9. Controller

HTTP 요청을 받아 Service를 호출하고 결과를 반환합니다.

```java
package kr.ac.kmu.capstone.balance_api.controller;

import kr.ac.kmu.capstone.balance_api.dto.*;
import kr.ac.kmu.capstone.balance_api.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // REST API 컨트롤러
@RequestMapping("/api/games") // 이 컨트롤러의 모든 API는 /api/games로 시작
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // GET /api/games - 게임 목록 조회
    @GetMapping
    public List<GameResponse> getGames() {
        return gameService.findAll();
    }

    // POST /api/games - 게임 생성
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // 201 Created 응답
    public GameResponse createGame(@RequestBody GameCreateRequest request) {
        return gameService.create(request);
    }

    // PUT /api/games/{gameId} - 게임 수정
    @PutMapping("/{gameId}")
    public GameResponse updateGame(
            @PathVariable Long gameId,
            @RequestBody GameUpdateRequest request
    ) {
        return gameService.update(gameId, request);
    }

    // DELETE /api/games/{gameId} - 게임 삭제
    @DeleteMapping("/{gameId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204 No Content 응답
    public void deleteGame(@PathVariable Long gameId) {
        gameService.delete(gameId);
    }

    // POST /api/games/{gameId}/vote - 투표
    @PostMapping("/{gameId}/vote")
    public VoteResponse vote(
            @PathVariable Long gameId,        // URL 경로에서 gameId 추출
            @RequestBody VoteRequest request   // 요청 본문에서 choice 추출
    ) {
        return gameService.vote(gameId, request);
    }
}
```

---

## 10. 동작 확인

서버를 실행하고, 앞서 작성한 `local-dev/api-test.http` 파일로 API를 테스트합니다.

```bash
./gradlew bootRun
```

VS Code에서 `local-dev/api-test.http`를 열고 각 요청의 **Send Request**를 클릭하여 테스트합니다.

> 강의 마지막에 **댓글(Comment) API를 직접 추가하는 자율 실습**을 진행합니다.
