# Spring Boot란?

## Java 웹 프레임워크

Spring Boot는 Java 기반의 웹 애플리케이션을 빠르게 만들 수 있는 프레임워크입니다. 최소한의 설정으로 바로 실행 가능한 애플리케이션을 만들 수 있도록 설계되었으며, 국내 기업에서 가장 많이 사용하는 백엔드 프레임워크입니다.

| 특징 | 설명 |
|------|------|
| 빠른 시작 | 복잡한 설정 없이 바로 개발 시작 |
| 내장 서버 | Tomcat이 내장되어 별도 서버 설치 불필요 |
| 자동 설정 | 의존성에 맞춰 자동으로 환경 구성 |
| 생태계 | 방대한 라이브러리와 커뮤니티 |

## 의존성 주입 (Dependency Injection)

의존성 주입은 Spring의 기반을 이루는 핵심 기술입니다. Spring이 제공하는 대부분의 기능(웹, 데이터, 보안 등)은 DI 위에서 동작합니다.

Spring Boot 코드를 보면 이런 패턴이 자주 등장합니다:

```java
@RestController
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }
}
```

`GameController`는 `GameService`가 필요합니다. 그런데 `new GameService()`를 직접 만들지 않습니다. **Spring Boot가 알아서 만들어서 넣어줍니다.** 이것이 의존성 주입(DI)입니다.

### 동작 원리

1. Spring Boot가 시작되면 `@Controller`, `@Service`, `@Repository` 등이 붙은 클래스를 자동으로 찾음
2. 이 클래스들의 인스턴스(객체)를 미리 생성해둠
3. 생성자에 필요한 객체가 있으면 자동으로 넣어줌 (주입)

```
Spring Boot 시작
  → GameRepository 객체 생성
  → GameService 객체 생성 (GameRepository 주입)
  → GameController 객체 생성 (GameService 주입)
  → 준비 완료, 요청 대기
```

### 왜 직접 new로 만들지 않는가?

```java
// 직접 생성 - 의존하는 모든 객체를 직접 만들어야 함
GameController controller = new GameController(
    new GameService(
        new GameRepository(...)
    )
);
```

- 직접 생성하면 → `GameRepository`가 바뀌면 `GameService`, `GameController`까지 수정해야 함
- DI를 사용하면 → 각 컴포넌트는 자신이 필요한 것만 선언. 생성과 연결은 Spring이 담당

> Spring Boot에서 `@Service`, `@Repository` 같은 어노테이션은 "이 클래스를 Spring이 관리해줘"라는 의미입니다.

### Spring의 핵심 개념

| 개념 | 설명 | 이 강의에서 |
|------|------|-----------|
| **IoC/DI** | 객체 생성과 의존성 관리를 Spring이 대신 함 | 다룸 |
| **AOP** | 로깅, 트랜잭션 등 횡단 관심사를 분리 | 다루지 않음 |
| **Service Abstraction** | 기술이 바뀌어도 코드를 변경하지 않도록 추상화 | 다루지 않음 |

이 강의에서는 IoC/DI만 다루지만, AOP와 Service Abstraction은 캡스톤 프로젝트를 진행하면서 함께 학습하시면 Spring을 더 깊이 이해할 수 있습니다.

## Java vs Kotlin

Spring Boot는 **Java**와 **Kotlin** 두 언어를 모두 지원합니다.

```java
// Java
public class GameService {
    public List<GameResponse> findAll() {
        return gameRepository.findAll()
            .stream()
            .map(GameResponse::from)
            .toList();
    }
}
```

```kotlin
// Kotlin - 같은 로직이 더 간결
class GameService {
    fun findAll(): List<GameResponse> =
        gameRepository.findAll().map { GameResponse.from(it) }
}
```

| | Java | Kotlin |
|---|---|---|
| 문법 | 다소 장황 (Java 21에서 개선 중) | 간결 (동일 로직 대비 약 20~40% 적은 코드) |
| 러닝 커브 | 대학에서 배운 문법 그대로 | Java를 알면 빠르게 적응 가능 |
| 국내 채용 | 대부분의 기업 (Fortune 500의 90%가 Java 백엔드) | 카카오, 라인, 쿠팡 등 점차 확대 |
| Null 안전성 | NPE 발생 가능 | 언어 차원에서 Null 안전 |
| 새 프로젝트 채택 | 여전히 주류 | 신규 백엔드 프로젝트의 30% 이상 |

이 강의에서는 **Java**를 사용합니다. 학교에서 배운 문법을 바로 활용할 수 있어 학습 부담이 적습니다.

> Java는 여전히 기업 백엔드 시장에서 압도적 주류이지만, 업계에서는 **새로운 프로젝트를 중심으로 Kotlin 채택이 빠르게 늘어나는 추세**입니다. Kotlin은 Java와 100% 호환되면서도 코드 라인 수가 적고, 언어 차원의 타입 안전성이 높습니다. Kotlin이 가능하신 분들은 캡스톤 프로젝트에서 Kotlin을 사용하시는 것을 권장합니다.
