# 백엔드 배포

> 배포 옵션 비교는 **배포 전략** 페이지를 참고하세요.

## 수동 배포

Spring Boot 앱을 Docker 이미지로 빌드하고, ECR에 push하여 ECS Express Mode에 배포합니다.

> CloudFormation으로 ECS Cluster, Service, Task Definition이 이미 생성되어 있습니다. 여기서는 **Docker 이미지를 ECR에 push하고 ECS를 업데이트**하는 과정만 진행합니다.

### 1. Dockerfile 작성

`balance-api` 프로젝트 루트에 `Dockerfile`을 생성합니다.

```
balance-api/
├── Dockerfile              ← 여기에 생성
├── build.gradle.kts
└── src/
```

```dockerfile
# balance-api/Dockerfile

FROM amazoncorretto:21
WORKDIR /app
COPY build/libs/balance-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. JAR 빌드 + Docker 이미지 빌드

```bash
# balance-api 프로젝트에서

# JAR 빌드 (build/libs/balance-api-0.0.1-SNAPSHOT.jar 생성)
./gradlew bootJar

# Docker 이미지 빌드
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

> 클러스터명과 서비스명은 CloudFormation Outputs의 `ECSClusterName`, `ECSServiceName`에서 확인합니다.

### 6. 확인

ECS Express Mode가 자동 생성한 URL 또는 CloudFormation Outputs에서 확인합니다.

```bash
curl http://{서비스 URL}/api/health
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
ECS Express Mode (컨테이너 실행 + ALB 자동 구성)
    ↓
사용자 접근
```

> 이 과정을 매번 수동으로 하는 것은 번거롭습니다. **자동 배포** 섹션에서 GitHub Actions로 자동화합니다.
