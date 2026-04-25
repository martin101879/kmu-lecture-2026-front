# Spring Boot란?

## Java 웹 프레임워크

Spring Boot는 Java 기반의 웹 애플리케이션을 빠르게 만들 수 있는 프레임워크입니다. 최소한의 설정으로 바로 실행 가능한 애플리케이션을 만들 수 있도록 설계되었으며, 국내 기업에서 가장 많이 사용하는 백엔드 프레임워크입니다.

| 특징 | 설명 |
|------|------|
| 빠른 시작 | 복잡한 설정 없이 바로 개발 시작 |
| 내장 서버 | Tomcat이 내장되어 별도 서버 설치 불필요 |
| 자동 설정 | 의존성에 맞춰 자동으로 환경 구성 |
| 생태계 | 방대한 라이브러리와 커뮤니티 |

### Spring vs Spring Boot

검색하면 "Spring"과 "Spring Boot"가 함께 나옵니다. Spring은 Java 웹 개발의 핵심 기능(DI, 웹 MVC, 데이터 접근 등)을 제공하는 **프레임워크**이고, Spring Boot는 이 Spring을 **쉽게 사용할 수 있도록 포장한 도구**입니다.

```
Spring:      강력하지만 설정이 많음 (XML, Java Config 등 직접 작성)
Spring Boot: Spring + 자동 설정 + 내장 서버 → 바로 실행 가능
```

Spring Boot 이전에는 서버(Tomcat)를 별도로 설치하고, DB 연결, JSON 변환 등의 설정을 하나하나 작성해야 했습니다. Spring Boot는 이런 반복적인 설정을 자동으로 처리하여 **비즈니스 로직에 집중**할 수 있게 해줍니다.

> 현재 Spring으로 새 프로젝트를 시작한다면 사실상 Spring Boot를 사용합니다. 이 강의에서 "Spring"이라고 하면 Spring Boot를 포함한 Spring 생태계 전체를 의미합니다.

## 의존성 주입 (Dependency Injection)

이후 코드를 작성하면 "객체를 직접 생성하지 않는데 어떻게 동작하지?"라는 의문이 생깁니다. 이것을 이해하려면 DI를 먼저 알아야 합니다.

Spring Boot 코드를 보면 이런 패턴이 자주 등장합니다:

```java
@Component
public class OrderService {

    private final PaymentService paymentService;

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

`OrderService`는 `PaymentService`가 필요합니다. 그런데 `new PaymentService()`를 직접 만들지 않습니다. **Spring Boot가 알아서 만들어서 넣어줍니다.** 이것이 의존성 주입(DI)입니다.

### @Component

`@Component`는 "이 클래스를 Spring이 관리해줘"라는 의미의 어노테이션입니다. `@Component`가 붙은 클래스는 Spring이 자동으로 객체를 생성하고 관리합니다.

### 동작 원리

![DI 동작 과정](/images/di-concept.svg)

1. Spring Boot가 시작되면 `@Component`가 붙은 클래스를 자동으로 찾음
2. 이 클래스들의 인스턴스(객체)를 미리 생성해둠
3. 생성자에 필요한 객체가 있으면 자동으로 넣어줌 (주입)

### 왜 직접 new로 만들지 않는가?

```java
// 직접 생성 - 의존하는 모든 객체를 직접 만들어야 함
OrderService orderService = new OrderService(
    new PaymentService(
        new PgClient(...)
    )
);
```

- 직접 생성하면 → 의존 관계가 깊어질수록 `new`의 연쇄가 복잡해짐. 모든 객체의 생성 순서와 방법을 개발자가 직접 관리해야 함
- DI를 사용하면 → 각 컴포넌트는 자신이 필요한 타입만 선언. 생성 순서, 생명주기 관리, 연결은 Spring이 담당

> 이후 코드에서 보게 될 `@Service`, `@Repository`, `@Controller`는 모두 `@Component`의 확장입니다. 기능은 동일하지만, 역할에 맞는 이름을 사용하여 **코드만 보고 이 클래스가 어떤 역할인지 바로 알 수 있도록** 합니다.

### Spring의 핵심 개념

| 개념 | 설명 | 이 강의에서 |
|------|------|-----------|
| **IoC/DI** | 객체 생성과 의존성 관리를 Spring이 대신 함 | 다룸 |
| **AOP** | 로깅, 트랜잭션 등 횡단 관심사를 분리 | 다루지 않음 |
| **Service Abstraction** | 기술이 바뀌어도 코드를 변경하지 않도록 추상화 | 다루지 않음 |

> IoC(제어의 역전)는 앞서 배운 "프레임워크가 개발자의 코드를 호출하는 것"이고, DI는 그 구체적인 구현 방식입니다.

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
