# REST API 만들기

밸런스 게임의 백엔드 API를 구현합니다. 이 코드들은 **베이스 앱으로 사전 제공**됩니다.

## API 목록

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/games` | 게임 목록 조회 (최신순) |
| `POST` | `/api/games` | 게임 생성 |
| `POST` | `/api/games/{gameId}/vote` | 게임 참여 (A 또는 B 선택) |

## Entity

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

    // 투표 메서드
    public void voteA() { this.countA++; }
    public void voteB() { this.countB++; }
}
```

## Repository

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

## DTO

### 요청 DTO

```java
package kr.ac.kmu.capstone.balance_api.dto;

// 게임 생성 요청
public record GameCreateRequest(
    String title,
    String optionA,
    String optionB
) {}

// 투표 요청
public record VoteRequest(
    String choice  // "A" 또는 "B"
) {}
```

### 응답 DTO

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

// 투표 결과 응답
public record VoteResponse(
    int countA,
    int countB
) {}
```

## Service

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
    public GameResponse create(GameCreateRequest request) {
        Game game = new Game(
            request.title(),
            request.optionA(),
            request.optionB()
        );
        Game saved = gameRepository.save(game);  // DB에 저장
        return GameResponse.from(saved);
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

## Controller

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

## 동작 확인

서버를 실행하고 API를 테스트합니다.

```bash
./gradlew bootRun
```

### 게임 생성

```bash
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"점심 메뉴 고르기","optionA":"짜장면","optionB":"짬뽕"}'
```

### 게임 목록 조회

```bash
curl http://localhost:8080/api/games
```

### 투표

```bash
curl -X POST http://localhost:8080/api/games/1/vote \
  -H "Content-Type: application/json" \
  -d '{"choice":"A"}'
```

> 이 API들이 밸런스 게임의 **베이스 코드**입니다.
> 실습에서는 여기에 **댓글(Comment) API를 추가**합니다.
