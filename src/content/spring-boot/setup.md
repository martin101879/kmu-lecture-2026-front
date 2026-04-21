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

## 프로젝트 구조

```
src/
├── main/
│   ├── java/ac/kr/kmu/capstone/
│   │   ├── CapstoneApplication.java
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   └── resources/
│       └── application.yml
└── test/
```

> 강의에서는 간단한 CRUD API를 만들어 봅니다.
