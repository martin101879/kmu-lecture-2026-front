# Spring Boot 프로젝트 생성

## Spring Initializr

[start.spring.io](https://start.spring.io)에서 프로젝트를 생성합니다.

### 설정값

- **Project**: Gradle - Kotlin
- **Language**: Java
- **Spring Boot**: 3.x.x (최신 stable)
- **Group**: `ac.kr.kmu`
- **Artifact**: `capstone`
- **Dependencies**:
  - Spring Web
  - Spring Data JPA
  - H2 Database

## Gradle

프로젝트를 생성하면 Gradle이 기본으로 포함되어 있습니다. 별도 설치가 필요 없습니다.

Gradle은 Java/Kotlin 프로젝트에서 **의존성 관리와 빌드**를 담당하는 도구입니다.

- **의존성 관리**: 프로젝트에 필요한 외부 라이브러리를 `build.gradle`에 선언하면, Gradle이 자동으로 다운로드하고 관리
- **빌드**: 소스 코드 컴파일, 테스트 실행, 실행 가능한 JAR 파일 생성까지 한 번에 수행

`build.gradle` 파일 하나에 프로젝트 설정, 의존성, 빌드 방식이 모두 정의됩니다.

```groovy
// build.gradle 예시 - 의존성 추가
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.mysql:mysql-connector-j'
}
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `./gradlew clean` | 빌드 결과물 삭제 (초기화) |
| `./gradlew compileJava` | Java 소스 코드 컴파일 (단독으로 잘 사용하지 않음) |
| `./gradlew test` | 테스트 실행 |
| `./gradlew build` | compileJava + test + JAR 생성을 한 번에 수행 |
| `./gradlew bootRun` | 개발 서버 실행 |

## 프로젝트 구조

```
├── build.gradle              ← 빌드 설정 + 의존성 관리
├── gradlew / gradlew.bat     ← Gradle Wrapper (설치 없이 빌드)
└── src/
    ├── main/
    │   ├── java/ac/kr/kmu/capstone/
    │   │   ├── CapstoneApplication.java
    │   │   ├── controller/
    │   │   ├── service/
    │   │   ├── repository/
    │   │   └── entity/
    │   └── resources/
    │       └── application.yml   ← 설정 파일
    └── test/
```

> 강의에서는 간단한 CRUD API를 만들어 봅니다.
