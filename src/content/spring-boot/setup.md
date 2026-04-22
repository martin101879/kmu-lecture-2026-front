# Spring Boot 프로젝트 생성

## Spring Initializr

[start.spring.io](https://start.spring.io)에서 프로젝트를 생성합니다.

### 설정값

- **Project**: Gradle - Kotlin
- **Language**: Java
- **Spring Boot**: 3.5.13
- **Group**: `kr.ac.kmu.capstone`
- **Artifact**: `balance-api`
- **Dependencies**:
  - Spring Web

### 생성된 프로젝트 구조

위 설정으로 프로젝트를 생성하면 아래와 같은 구조가 만들어집니다.

```
balance-api/
├── build.gradle.kts              ← 빌드 설정 + 의존성 관리
├── settings.gradle.kts
├── gradlew / gradlew.bat         ← Gradle Wrapper
└── src/
    ├── main/
    │   ├── java/kr/ac/kmu/capstone/balance_api/
    │   │   └── BalanceApiApplication.java  ← 애플리케이션 진입점
    │   └── resources/
    │       ├── application.yml              ← 설정 파일
    │       ├── static/                      ← 정적 파일
    │       └── templates/                   ← 템플릿 파일
    └── test/
        └── java/kr/ac/kmu/capstone/balance_api/
            └── BalanceApiApplicationTests.java
```

## Gradle

프로젝트를 생성하면 Gradle이 기본으로 포함되어 있습니다. 별도 설치가 필요 없습니다.

Gradle은 Java/Kotlin 프로젝트에서 **의존성 관리와 빌드**를 담당하는 도구입니다.

- **의존성 관리**: 프로젝트에 필요한 외부 라이브러리를 `build.gradle.kts`에 선언하면, Gradle이 자동으로 다운로드하고 관리
- **빌드**: 소스 코드 컴파일, 테스트 실행, 실행 가능한 JAR 파일 생성까지 한 번에 수행

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `./gradlew clean` | 빌드 결과물 삭제 (초기화) |
| `./gradlew compileJava` | Java 소스 코드 컴파일 (단독으로 잘 사용하지 않음) |
| `./gradlew test` | 테스트 실행 |
| `./gradlew build` | compileJava + test + JAR 생성을 한 번에 수행 |
| `./gradlew bootRun` | 개발 서버 실행 |

### build.gradle.kts

생성된 `build.gradle.kts`의 내용입니다.

```kotlin
// 플러그인 설정
plugins {
    java                                                          // Java 프로젝트
    id("org.springframework.boot") version "3.5.13"               // Spring Boot
    id("io.spring.dependency-management") version "1.1.7"         // 의존성 버전 자동 관리
}

// 프로젝트 정보
group = "kr.ac.kmu.capstone"
version = "0.0.1-SNAPSHOT"

// Java 버전 설정
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

// 의존성을 다운로드할 저장소
repositories {
    mavenCentral()
}

// 프로젝트에서 사용하는 라이브러리 (의존성)
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")         // REST API 개발
    testImplementation("org.springframework.boot:spring-boot-starter-test")    // 테스트
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// 테스트 실행 시 JUnit 5 (Jupiter) 엔진 사용
tasks.withType<Test> {
    useJUnitPlatform()
}
```

이후 DB 연동이 필요하면 `dependencies`에 아래를 추가합니다.

```kotlin
dependencies {
    // 기존 의존성...
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
}
```

## Starter란?

`build.gradle.kts`의 `dependencies`에 선언하는 `spring-boot-starter-*`는 특정 기능에 필요한 라이브러리들을 하나로 묶어놓은 패키지입니다.

### 대표적인 Starter

| Starter | 포함되는 것 | 역할 |
|---------|-----------|------|
| `spring-boot-starter-web` | Spring MVC, 내장 Tomcat, Jackson(JSON) | REST API 개발 |
| `spring-boot-starter-data-jpa` | Spring Data JPA, Hibernate | DB 접근 + 자동 쿼리 생성 |
| `spring-boot-starter-security` | Spring Security | 인증/인가 |
| `spring-boot-starter-test` | JUnit, Mockito, AssertJ | 테스트 |
| `spring-boot-starter-validation` | Hibernate Validator | 요청 데이터 유효성 검증 |

> `mysql-connector-j` (MySQL JDBC 드라이버)는 Starter가 아닌 개별 라이브러리이며, DB 연결 시 별도로 추가합니다.

Starter 덕분에 개발자가 개별 라이브러리를 하나씩 찾아서 버전을 맞출 필요 없이, Starter 하나만 추가하면 호환되는 라이브러리들이 자동으로 포함됩니다.

## 실습: 첫 번째 API 만들기

프로젝트가 제대로 동작하는지 간단한 API를 만들어 확인합니다.

### 1. 패키지 생성

`src/main/java/kr/ac/kmu/capstone/balance_api/` 아래에 다음 패키지를 생성합니다.

```
src/main/java/kr/ac/kmu/capstone/balance_api/
├── BalanceApiApplication.java
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

### 2. DTO 작성

`dto/` 패키지에 `HealthResponse.java`를 생성합니다.

```java
package kr.ac.kmu.capstone.balance_api.dto;

// record: 불변 데이터 객체를 간결하게 정의. 생성자, getter, equals, hashCode, toString 자동 생성
public record HealthResponse(String status, String message) {
}
```

### 3. Controller 작성

`controller/` 패키지에 `HealthController.java`를 생성합니다.

```java
package kr.ac.kmu.capstone.balance_api.controller;

import kr.ac.kmu.capstone.balance_api.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // 이 클래스가 REST API 컨트롤러임을 선언. 반환값을 자동으로 JSON 변환
public class HealthController {

    @GetMapping("/api/health") // GET /api/health 요청이 오면 이 메서드 실행
    public HealthResponse health() {
        return new HealthResponse("ok", "Balance API is running!");
    }
}
```

### 현재 파일 구조

```
src/main/java/kr/ac/kmu/capstone/balance_api/
├── BalanceApiApplication.java
├── controller/
│   └── HealthController.java
├── dto/
│   └── HealthResponse.java
├── service/          (비어 있음)
├── repository/       (비어 있음)
└── entity/           (비어 있음)
```

### 4. 실행 및 확인

서버를 실행합니다.

```bash
./gradlew bootRun
```

브라우저에서 아래 주소에 접속합니다.

```
http://localhost:8080/api/health
```

아래와 같은 JSON 응답이 나오면 성공입니다.

```json
{
  "status": "ok",
  "message": "Balance API is running!"
}
```

> 축하합니다! 첫 번째 Spring Boot API가 동작합니다.
> Controller가 DTO를 생성하고 JSON으로 반환하는 기본 흐름을 확인했습니다.
