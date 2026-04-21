# 레퍼런스

## 주요 어노테이션

### 컴포넌트 등록

Spring Boot가 자동으로 찾아서 관리하는 클래스에 붙이는 어노테이션입니다.

| 어노테이션 | 대상 | 설명 |
|-----------|------|------|
| `@SpringBootApplication` | 메인 클래스 | 애플리케이션 진입점. 하위 패키지 자동 스캔 |
| `@RestController` | Controller | HTTP 요청 처리 + JSON 응답 반환 |
| `@Service` | Service | 비즈니스 로직 처리 |
| `@Repository` | Repository | 데이터베이스 접근 |
| `@Entity` | Entity | DB 테이블과 매핑되는 클래스 |

### HTTP 매핑

Controller에서 URL과 메서드를 연결하는 어노테이션입니다.

| 어노테이션 | HTTP 메서드 | 용도 | 예시 |
|-----------|-----------|------|------|
| `@GetMapping` | GET | 조회 | 게임 목록, 댓글 목록 |
| `@PostMapping` | POST | 생성 | 게임 생성, 댓글 작성 |
| `@PutMapping` | PUT | 전체 수정 | 게임 정보 수정 |
| `@PatchMapping` | PATCH | 부분 수정 | 투표 수 증가 |
| `@DeleteMapping` | DELETE | 삭제 | 게임 삭제 |
| `@RequestMapping` | 공통 경로 | 클래스 레벨 URL 접두사 | `/api/games` |

### 파라미터 바인딩

요청 데이터를 메서드 파라미터에 바인딩하는 어노테이션입니다.

| 어노테이션 | 용도 | 예시 |
|-----------|------|------|
| `@RequestBody` | JSON 요청 본문 → 객체 변환 | `@RequestBody GameCreateRequest request` |
| `@PathVariable` | URL 경로 변수 | `/api/games/{id}` → `@PathVariable Long id` |
| `@RequestParam` | 쿼리 파라미터 | `?page=1` → `@RequestParam int page` |

### JPA 관련

Entity 클래스에서 사용하는 어노테이션입니다.

| 어노테이션 | 설명 |
|-----------|------|
| `@Entity` | 이 클래스가 DB 테이블과 매핑됨을 선언 |
| `@Id` | 기본 키(Primary Key) 필드 |
| `@GeneratedValue` | 기본 키 자동 생성 전략 |
| `@Column` | 컬럼 상세 설정 (이름, 길이, nullable 등). 생략 시 필드명 그대로 사용 |
| `@ManyToOne` | 다대일 관계 (예: 댓글 → 게임) |
| `@OneToMany` | 일대다 관계 (예: 게임 → 댓글 목록) |

## JPA 기본 제공 메서드

`JpaRepository`를 상속하면 별도 구현 없이 아래 메서드를 사용할 수 있습니다.

```java
public interface GameRepository extends JpaRepository<Game, Long> {
    // 아래 메서드들이 자동 제공됨
}
```

### 조회

| 메서드 | 반환 타입 | 설명 |
|--------|----------|------|
| `findAll()` | `List<Game>` | 전체 조회 |
| `findById(Long id)` | `Optional<Game>` | ID로 단건 조회 |
| `existsById(Long id)` | `boolean` | 존재 여부 확인 |
| `count()` | `long` | 전체 개수 |

### 저장 / 수정

| 메서드 | 반환 타입 | 설명 |
|--------|----------|------|
| `save(Game entity)` | `Game` | 저장 (새 Entity면 INSERT, 기존이면 UPDATE) |
| `saveAll(List<Game> entities)` | `List<Game>` | 여러 건 저장 |

### 삭제

| 메서드 | 반환 타입 | 설명 |
|--------|----------|------|
| `deleteById(Long id)` | `void` | ID로 삭제 |
| `delete(Game entity)` | `void` | Entity로 삭제 |
| `deleteAll()` | `void` | 전체 삭제 |

### 쿼리 메서드 (메서드 이름 기반)

메서드 이름을 규칙에 맞게 작성하면 JPA가 자동으로 쿼리를 생성합니다.

```java
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // SELECT * FROM comment WHERE game_id = ? ORDER BY created_at DESC
    List<Comment> findByGameIdOrderByCreatedAtDesc(Long gameId);

    // SELECT COUNT(*) FROM comment WHERE game_id = ?
    long countByGameId(Long gameId);

    // SELECT * FROM comment WHERE author = ?
    List<Comment> findByAuthor(String author);
}
```

| 키워드 | 예시 | 생성되는 SQL |
|--------|------|------------|
| `findBy` | `findByTitle(String title)` | `WHERE title = ?` |
| `findBy...And` | `findByTitleAndAuthor(...)` | `WHERE title = ? AND author = ?` |
| `findBy...Or` | `findByTitleOrAuthor(...)` | `WHERE title = ? OR author = ?` |
| `OrderBy...Desc` | `findByGameIdOrderByCreatedAtDesc(...)` | `ORDER BY created_at DESC` |
| `countBy` | `countByGameId(Long gameId)` | `SELECT COUNT(*) WHERE game_id = ?` |
