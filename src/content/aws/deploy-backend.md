# 백엔드 배포

## 백엔드 배포 방식

백엔드 서버는 애플리케이션이 **계속 실행**되어야 합니다. AWS에서 서버를 배포하는 방법은 여러 가지가 있습니다.

### EC2 (가상 서버)

가장 기본적인 방식입니다. 가상 서버를 빌려서 직접 관리합니다.

```
JAR 빌드 → EC2에 파일 전송 → SSH 접속 → java -jar 실행
```

| 장점 | 단점 |
|------|------|
| 개념이 단순 | 서버 관리 직접 해야 함 (Java 설치, 보안 패치 등) |
| 프리티어 사용 가능 | 배포 자동화가 번거로움 |
| SSH로 디버깅 가능 | 스케일링이 어려움 |

### Elastic Beanstalk

AWS가 EC2, ALB, Auto Scaling 등을 자동으로 구성해줍니다. 코드만 업로드하면 됩니다.

```
JAR 업로드 → Beanstalk이 EC2 생성 + ALB 구성 + 배포
```

| 장점 | 단점 |
|------|------|
| 인프라 자동 구성 | 세부 제어가 제한적 |
| 배포가 간편 | 내부 구조를 이해하기 어려움 |
| Auto Scaling 지원 | 커스터마이징이 필요하면 오히려 복잡 |

### ECS Fargate (컨테이너)

Docker 컨테이너를 실행하는 서버리스 방식입니다. 서버를 직접 관리하지 않습니다.

```
Docker 이미지 빌드 → ECR에 push → ECS가 컨테이너 실행
```

| 장점 | 단점 |
|------|------|
| 서버 관리 불필요 (Fargate) | Docker 지식 필요 |
| 로컬과 동일한 환경 (Docker) | EC2보다 비용이 약간 높음 |
| 스케일링 용이 | 디버깅이 EC2보다 어려움 (SSH 불가) |
| 실무에서 많이 사용 | |

### Lambda (서버리스 함수)

서버 없이 함수 단위로 실행됩니다. 요청이 있을 때만 실행되고, 없으면 비용이 0입니다.

| 장점 | 단점 |
|------|------|
| 서버 관리 완전 불필요 | Spring Boot와 맞지 않음 (Cold Start) |
| 사용한 만큼만 과금 | 실행 시간 제한 (15분) |
| | 기존 서버 애플리케이션 구조 변경 필요 |

### 비교 요약

| | EC2 | Elastic Beanstalk | ECS Fargate | Lambda |
|---|---|---|---|---|
| 관리 수준 | 직접 관리 | 반자동 | 서버리스 | 완전 서버리스 |
| Docker | 선택 | 선택 | 필수 | 불필요 |
| 비용 | 프리티어 가능 | 프리티어 가능 | 약간 높음 | 사용량 비례 |
| 스케일링 | 수동 | 자동 | 자동 | 자동 |
| 실무 사용 | 소규모 | 중규모 | 대규모 | 이벤트 처리 |
| 난이도 | 낮음 | 낮음 | 중간 | 높음 (구조 변경) |

이 강의에서는 **ECS Fargate**를 사용합니다.

- Docker를 이미 배웠으므로 자연스럽게 연결
- 로컬(Docker)과 서버(ECS)의 실행 환경이 동일
- 실무에서 가장 많이 사용하는 구성

---

## 수동 배포

Spring Boot 앱을 Docker 이미지로 빌드하고, ECR에 push하여 ECS에 배포합니다.

### 1. Dockerfile 작성

프로젝트 루트에 `Dockerfile`을 생성합니다.

```dockerfile
# balance-api/Dockerfile

# ── 빌드 단계 ──
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

# ── 실행 단계 ──
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **멀티 스테이지 빌드**: 빌드 단계(JDK)와 실행 단계(JRE)를 분리하여 최종 이미지 크기를 줄입니다.

### 2. 로컬에서 Docker 이미지 빌드

```bash
# balance-api 프로젝트에서
docker build -t balance-api .
```

### 3. ECR 로그인

CloudFormation Outputs에서 확인한 ECR URI를 사용합니다.

```bash
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin {ECR URI 앞부분}
```

예시:
```bash
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
```

### 4. 이미지 태그 및 Push

```bash
# 이미지에 ECR 태그 추가
docker tag balance-api:latest {ECR URI}:latest

# ECR에 push
docker push {ECR URI}:latest
```

### 5. ECS 서비스 업데이트

새 이미지로 ECS 서비스를 업데이트합니다.

```bash
aws ecs update-service \
  --cluster balance-game \
  --service balance-api \
  --force-new-deployment
```

ECS가 새 이미지를 pull하고 컨테이너를 교체합니다. 약 1~2분 소요됩니다.

### 6. 확인

CloudFormation Outputs의 `APIUrl`에 접속하여 확인합니다.

```bash
curl http://{ALB DNS Name}/api/health
```

```json
{
  "status": "ok",
  "message": "Balance API is running!"
}
```

### 배포 흐름 정리

```
소스 코드
    ↓ docker build
Docker 이미지 (로컬)
    ↓ docker push
ECR (이미지 저장소)
    ↓ ecs update-service
ECS Fargate (컨테이너 실행)
    ↓
ALB (로드 밸런서) → 사용자 접근
```

> 이 과정을 매번 수동으로 하는 것은 번거롭습니다. **자동 배포** 섹션에서 GitHub Actions로 자동화합니다.
