# Spring Boot 프로젝트 생성

## Spring Initializr

[start.spring.io](https://start.spring.io)에서 프로젝트를 생성합니다.

### 설정값

- **Project**: Gradle - Kotlin
- **Language**: Java
- **Spring Boot**: 3.x.x (최신 stable)
- **Group**: `kr.ac.kmu`
- **Artifact**: `capstone`
- **Dependencies**:
  - Spring Web
  - Spring Data JPA
  - H2 Database

### Starter란?

Spring Initializr에서 선택한 Dependencies는 `build.gradle`에 **Starter** 의존성으로 추가됩니다. Starter는 특정 기능에 필요한 라이브러리들을 하나로 묶어놓은 패키지입니다.

| Starter | 포함되는 것 | 역할 |
|---------|-----------|------|
| `spring-boot-starter-web` | Spring MVC, 내장 Tomcat, Jackson(JSON) | REST API 개발에 필요한 모든 것 |
| `spring-boot-starter-data-jpa` | Spring Data JPA, Hibernate | DB 접근 + 자동 쿼리 생성 |
| `mysql-connector-j` | MySQL JDBC 드라이버 | MySQL 연결 |

Starter 덕분에 개발자가 개별 라이브러리를 하나씩 찾아서 버전을 맞출 필요 없이, Starter 하나만 추가하면 호환되는 라이브러리들이 자동으로 포함됩니다.

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
