# Docker와 배포

## 로컬에서 배운 Docker

밸런스 게임 API 만들기에서 Docker를 사용해 **로컬 MySQL**을 실행했습니다.

```
docker compose up -d → MySQL 컨테이너 실행 → 로컬에서 개발
```

이때 배운 핵심 개념:

| 개념 | 설명 |
|------|------|
| 이미지 | 실행할 소프트웨어가 패키징된 파일 |
| 컨테이너 | 이미지를 기반으로 만든 격리된 실행 환경 |
| 이미지 저장소 | 이미지를 공유하는 원격 저장소 (Docker Hub, ECR 등) |

## 왜 Docker로 배포하는가?

Docker 없이 서버에 직접 배포하면:

```
서버에 런타임 설치 (Java, Node 등) → 의존하는 미들웨어 설치 (MySQL, Redis 등)
→ OS 설정 → 환경 변수 설정 → 애플리케이션 파일 전송 → 실행
```

문제점:
- "내 PC에서는 되는데 서버에서 안 돼요" (OS, 런타임 버전, 설정 차이)
- 서버마다 설치된 프로그램과 버전이 다를 수 있음
- 서버 교체/추가 시 동일한 셋업을 처음부터 반복
- 개발자마다 로컬 환경이 달라 "나는 되는데 너는 왜 안 돼?"

Docker로 배포하면:

```
Docker 이미지 빌드 (앱 + Java + 설정 모두 포함) → 어디서든 실행
```

- 로컬에서 동작하면 서버에서도 동작 (동일한 환경)
- 서버에 런타임/미들웨어 설치 불필요 (이미지 안에 포함)
- 서버 교체/추가해도 이미지만 실행하면 끝
- 개발, 테스트, 운영 환경이 모두 동일

> "내 PC에서 되면 어디서든 된다" - 이것이 Docker를 배포에 사용하는 핵심 이유입니다.

이러한 장점 때문에 현재 업계에서는 서버에 직접 프로그램을 설치하여 배포하는 방식보다 **Docker 이미지로 패키징하여 배포하는 방식이 표준**이 되었습니다. AWS ECS, Google Cloud Run, Kubernetes 등 주요 클라우드 서비스들도 모두 Docker 이미지 기반 배포를 지원합니다.

## 로컬 vs 배포

로컬에서는 **다른 사람이 만든 이미지**(mysql:8.0)를 가져와서 실행했습니다. 배포에서는 반대로, **우리가 만든 앱을 이미지로 만들어** 서버에서 실행합니다.

| | 로컬 개발 | 배포 |
|---|---|---|
| 목적 | MySQL을 로컬에서 실행 | Spring Boot 앱을 서버에서 실행 |
| 이미지 | `mysql:8.0` (남이 만든 것) | `balance-api` (우리가 만든 것) |
| 도구 | `docker-compose.yml` | `Dockerfile` |
| 실행 위치 | 내 PC | AWS (ECS) |

```
로컬:  Docker Hub에서 mysql:8.0 이미지 pull → 내 PC에서 실행
배포:  내 앱을 이미지로 빌드 → ECR에 push → AWS에서 실행
```

## Dockerfile

Dockerfile은 **이미지를 만드는 레시피**입니다. "어떤 환경에서, 어떤 파일을 넣고, 어떤 명령어로 실행할지"를 정의합니다.

예를 들어 Spring Boot 앱의 Dockerfile은 이런 형태입니다:

```dockerfile
FROM amazoncorretto:21           # Java 21 실행 환경을 기반으로
WORKDIR /app                          # 작업 디렉토리 설정
COPY my-app.jar app.jar               # JAR 파일을 이미지 안에 복사
ENTRYPOINT ["java", "-jar", "app.jar"]  # 컨테이너 시작 시 실행할 명령어
```

| 명령어 | 역할 |
|--------|------|
| `FROM` | 기반 이미지 선택. 이 이미지 위에 내 앱을 올림 |
| `WORKDIR` | 이후 명령어가 실행될 디렉토리 |
| `COPY` | 로컬 파일을 이미지 안에 복사 |
| `ENTRYPOINT` | 컨테이너 시작 시 실행할 명령어 |

> 실제 Dockerfile 작성은 다음 단계 **백엔드 배포**에서 진행합니다.

## 이미지 태그

Docker 이미지에는 **태그(tag)**를 붙여 버전을 구분합니다. `이미지명:태그` 형태입니다.

```
balance-api:latest     ← 최신 버전 (태그 생략 시 기본값)
balance-api:1.0.0      ← 특정 버전
mysql:8.0              ← MySQL 8.0 버전
```

ECR에 이미지를 push할 때는 **ECR 주소를 포함한 태그**를 붙여야 합니다.

```bash
# 로컬 이미지에 ECR 태그 추가
docker tag balance-api:latest {ECR URI}:latest
```

> 이 과정은 다음 단계 **백엔드 배포**에서 진행합니다.

## ECR (Elastic Container Registry)

로컬에서 만든 이미지를 AWS에서 실행하려면, 이미지를 **AWS가 접근 가능한 저장소**에 올려야 합니다. 이것이 ECR입니다.

```
Docker Hub  → 공개 이미지 저장소 (mysql, nginx 등)
ECR         → AWS 전용 비공개 이미지 저장소 (내 앱 이미지)
```

| | Docker Hub | ECR |
|---|---|---|
| 공개/비공개 | 둘 다 가능 | 비공개 (내 AWS 계정만 접근) |
| ECS 연동 | 가능하지만 느림 | 같은 AWS 내라 빠름 |
| 비용 | 무료 (공개) | 500MB 무료 |

![Docker 배포 흐름](/images/docker-deploy-flow.svg)

> CloudFormation이 ECR 리포지토리를 이미 생성해두었습니다. 다음 단계 **백엔드 배포**에서 이미지를 빌드하고 push합니다.
