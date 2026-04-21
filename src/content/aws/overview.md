# AWS 배포 전략

## 아키텍처 개요

```
[사용자] → [CloudFront] → [S3] (React 정적 파일)
                ↓
          [ALB] → [EC2 / ECS] (Spring Boot API)
                       ↓
                    [RDS] (Database)
```

## 캡스톤에서의 간소화 버전

학부 캡스톤에서는 아래와 같이 간소화할 수 있습니다:

| 서비스 | 용도 | 비고 |
|--------|------|------|
| EC2 | 백엔드 서버 | 프리티어 t2.micro |
| S3 | 프론트엔드 호스팅 | 정적 웹 호스팅 |
| RDS | 데이터베이스 | 프리티어 가능 |

## EC2에 Spring Boot 배포

```bash
# 1. JAR 빌드
./gradlew bootJar

# 2. EC2에 파일 전송
scp build/libs/capstone-0.0.1-SNAPSHOT.jar ec2-user@<IP>:~/

# 3. EC2에서 실행
ssh ec2-user@<IP>
nohup java -jar capstone-0.0.1-SNAPSHOT.jar &
```

> **Tip**: 실무에서는 Docker + ECS 또는 GitHub Actions CI/CD를 사용합니다.
