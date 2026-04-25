# 백엔드 배포

> 배포 옵션 비교는 **배포 방식** 페이지를 참고하세요.

## 수동 배포

Spring Boot 앱을 Docker 이미지로 빌드하고, ECR에 push한 뒤, EC2에 SSH 접속하여 컨테이너를 실행합니다.

> CloudFormation으로 EC2, ALB, ECR이 이미 생성되어 있습니다. EC2에는 Docker가 자동으로 설치되어 있습니다.

### 배포 흐름

```
소스 코드
    ↓ gradlew bootJar
JAR 파일
    ↓ docker build
Docker 이미지 (로컬)
    ↓ docker push
ECR (이미지 저장소)
    ↓ EC2에 SSH 접속
    ↓ docker pull + docker run
EC2 (컨테이너 실행)
    ↓
ALB (외부 요청을 EC2로 전달)
    ↓
사용자 접근
```

### 1. application-prod.yaml 작성

배포 환경용 설정 파일을 작성합니다. `src/main/resources/`에 `application-prod.yaml`을 생성합니다.

```
src/main/resources/
├── application.yaml          ← 기존 (로컬 개발용)
└── application-prod.yaml     ← 여기에 생성 (배포용)
```

```yaml
# application-prod.yaml - 배포 환경 설정

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/balance
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update

app:
  cors:
    allowed-origins: https://web.martin.cecil1018.click  # AWS 인프라 사전 셋업에서 생성한 웹용 도메인
```

> Spring Boot는 `--spring.profiles.active=prod`로 실행하면 `application.yaml`과 `application-prod.yaml`을 함께 로드합니다. 동일한 설정은 `prod`가 덮어씁니다.

| 파일 | 용도 | DB 주소 | CORS |
|------|------|---------|------|
| `application.yaml` | 로컬 개발 | localhost:3306 | http://localhost:5173 |
| `application-prod.yaml` | 배포 | RDS 주소 (환경 변수) | https://web.{이름}.cecil1018.click |

> `${DB_HOST}`, `${DB_PASSWORD}`는 환경 변수로 주입됩니다. docker run 시 `-e` 옵션으로 전달합니다.

### 2. Dockerfile 작성

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

### 3. JAR 빌드 + Docker 이미지 빌드

```bash
# balance-api 프로젝트에서

# JAR 빌드 (build/libs/balance-api-0.0.1-SNAPSHOT.jar 생성)
./gradlew bootJar

# Docker 이미지 빌드 (EC2의 amd64 아키텍처에 맞춰 빌드)
docker build --platform linux/amd64 -t balance-api .
```

> Apple Silicon Mac (M1/M2/M3/M4)에서 빌드하면 기본적으로 `arm64` 이미지가 생성됩니다. EC2는 `amd64` 아키텍처이므로 `--platform linux/amd64` 옵션을 반드시 지정해야 합니다. Intel Mac이나 Windows에서는 생략해도 됩니다.

### 4. ECR 로그인 + 이미지 Push

CloudFormation Outputs에서 확인한 ECR URI를 사용합니다.

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin {ECR URI 앞부분}

# 이미지에 ECR 태그 추가
docker tag balance-api:latest {ECR URI}:latest

# ECR에 push
docker push {ECR URI}:latest
```

### 5. EC2에 SSH 접속

CloudFormation Outputs의 `EC2PublicIP`와 스택 생성 시 선택한 키 페어를 사용합니다.

```bash
ssh -i {키 페어 파일}.pem ec2-user@{EC2 Public IP}
```

> 처음 접속 시 `Are you sure you want to continue connecting?` 메시지가 나오면 `yes`를 입력합니다.

### 6. EC2에서 컨테이너 실행

SSH로 접속한 EC2 안에서 아래 명령어를 실행합니다.

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin {ECR URI 앞부분}

# 이미지 다운로드
docker pull {ECR URI}:latest

# 기존 컨테이너 중지 및 삭제 (최초 배포 시에는 무시됨)
docker stop balance-api || true
docker rm balance-api || true

# 컨테이너 실행 (prod 프로필 활성화)
docker run -d --name balance-api \
  -p 8080:8080 \
  -e DB_HOST={RDS 주소} \
  -e DB_USERNAME=admin \
  -e DB_PASSWORD={DB 비밀번호} \
  -e SPRING_PROFILES_ACTIVE=prod \
  {ECR URI}:latest
```

| 옵션 | 설명 |
|------|------|
| `-d` | 백그라운드 실행 |
| `--name balance-api` | 컨테이너 이름 지정 (중지/삭제 시 사용) |
| `-p 8080:8080` | 호스트 포트:컨테이너 포트 매핑 |
| `-e DB_HOST` | application-prod.yaml의 `${DB_HOST}`에 주입 |
| `-e DB_USERNAME` | application-prod.yaml의 `${DB_USERNAME}`에 주입 |
| `-e DB_PASSWORD` | application-prod.yaml의 `${DB_PASSWORD}`에 주입 |
| `-e SPRING_PROFILES_ACTIVE=prod` | prod 프로필 활성화 → application-prod.yaml 로드 |

> - RDS 주소: CloudFormation Outputs의 `RDSEndpoint`
> - DB 비밀번호: 스택 생성 시 입력한 비밀번호

> **주의**: 이 강의에서는 편의상 환경 변수(`-e`)로 비밀번호를 전달하지만, 실무에서는 이 방식을 사용하지 않습니다. `docker inspect` 등으로 환경 변수가 그대로 노출되기 때문입니다. 실무에서는 **AWS Secrets Manager**나 **SSM Parameter Store** 같은 비밀 값 관리 서비스를 사용합니다.

### 7. 확인

CloudFormation Outputs의 `ApiUrl`로 확인합니다.

```bash
curl https://api.{본인 도메인}/api/health
```

```json
{
  "status": "ok",
  "message": "Balance API is running!"
}
```

> ALB가 EC2의 8080 포트로 요청을 전달합니다. 헬스 체크가 통과되면 정상입니다.

> 코드를 수정하고 재배포할 때는 **3~7단계를 반복**합니다. 이 과정을 매번 수동으로 하는 것은 번거롭습니다. **자동 배포** 섹션에서 GitHub Actions로 자동화합니다.
