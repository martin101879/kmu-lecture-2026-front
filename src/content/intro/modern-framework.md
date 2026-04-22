# 프레임워크의 핵심 원칙

## 프레임워크란?

프레임워크는 애플리케이션 개발에 필요한 **구조와 규칙을 미리 제공**하는 도구입니다.

라이브러리와의 차이:

| | 라이브러리 | 프레임워크 |
|---|---|---|
| 주도권 | 개발자가 필요할 때 호출 | 프레임워크가 흐름을 제어, 개발자는 규칙에 맞춰 코드 작성 |
| 예시 | JDBC 드라이버, Axios | Spring Boot, React |

라이브러리는 **개발자가 호출**합니다:

```java
// JDBC 드라이버 - 개발자가 직접 연결하고, 쿼리를 실행하고, 결과를 처리
Connection conn = DriverManager.getConnection(url);
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM game");
ResultSet rs = stmt.executeQuery();
```

프레임워크는 **프레임워크가 개발자의 코드를 호출**합니다:

```java
// Spring Boot - 프레임워크가 정한 규칙에 맞춰 코드를 작성하면
// 요청이 들어올 때 프레임워크가 이 메서드를 호출해줌
@GetMapping("/api/games")
public List<GameResponse> getGames() {
    return gameService.findAll();
}
```

이 차이를 **제어의 역전(Inversion of Control)** 이라고 합니다. 프레임워크를 사용한다는 것은 프레임워크의 규칙에 맞춰 코드를 작성하는 것입니다.

## Convention over Configuration (설정보다 관례)

프레임워크를 이해하는 가장 중요한 원칙입니다.

웹 애플리케이션을 만들려면 서버 포트, 디렉토리 구조, 빌드 설정, DB 연결 등 **설정해야 할 것이 매우 많습니다.** 프레임워크는 이런 설정들을 **관례(Convention)** 로 미리 정해둡니다.

관례는 크게 두 가지 형태입니다:

- **구조적 관례**: 디렉토리와 파일의 위치/이름 규칙 — "여기에 두면 자동으로 인식"
- **값의 관례**: 범용적인 기본값(Default) — "지정하지 않으면 이 값을 사용"

```
구조적 관례: src/main/java/ 에 코드를 두면 → 컴파일 대상으로 자동 인식
값의 관례:  서버 포트를 지정하지 않으면   → 8080으로 자동 실행
```

관례 덕분에 **아무것도 설정하지 않아도 바로 실행**할 수 있습니다. 관례를 벗어나야 할 때만 해당 값을 **재정의(Override)** 합니다.

```yaml
# application.yml - 포트를 8080이 아닌 9090으로 변경하고 싶을 때만 작성
server:
  port: 9090
```

> 즉, **"설정을 추가한다"는 것은 "관례를 덮어쓴다"는 의미**입니다.
> 아무것도 설정하지 않으면 프레임워크가 정한 관례대로 동작합니다.

## 관례 예시

### Frontend (React + Vite + npm)

```
├── package.json              ← 프로젝트 설정 + 의존성 목록
├── node_modules/             ← 의존성 자동 설치 디렉토리
├── index.html                ← 앱의 진입점 HTML (자동 인식)
├── public/                   ← 빌드 시 루트 경로로 그대로 복사
└── src/
    ├── main.tsx              ← JavaScript 엔트리 포인트
    └── components/
        └── *.module.css      ← CSS Modules로 자동 처리 (스코프 격리)
```

### Backend (Spring Boot + Gradle)

```
├── build.gradle              ← 빌드 설정 + 의존성 관리
├── gradlew / gradlew.bat     ← Gradle 설치 없이 빌드 가능 (Wrapper)
└── src/
    ├── main/
    │   ├── java/ 또는 kotlin/ ← 메인 소스 코드
    │   │   └── com/example/
    │   │       └── Application.java  ← @SpringBootApplication (하위 패키지 자동 스캔)
    │   └── resources/
    │       └── application.yml       ← 설정 파일 (자동 로드)
    └── test/
        └── java/             ← 테스트 코드
```

## 왜 이것이 중요한가?

프레임워크를 잘 사용하려면 **해당 프레임워크의 컨벤션과 기본값을 아는 것이 중요**합니다.

- 컨벤션을 따르면 → 설정 없이 자동으로 동작
- 컨벤션을 모르면 → "왜 되는지", "왜 안 되는지" 이해하기 어려움
- 컨벤션을 벗어나면 → 별도 설정이 필요하거나 동작하지 않음
- 기본값을 알면 → 필요한 것만 재정의하여 효율적으로 개발

> 이 강의에서는 Spring Boot, React, Gradle의 핵심 컨벤션을 코드를 통해 자연스럽게 익히게 됩니다.
