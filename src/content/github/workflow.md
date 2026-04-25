# GitHub Actions

## GitHub 저장소 생성

각자 GitHub에 아래 2개의 저장소를 생성합니다.

| 저장소 | 용도 |
|--------|------|
| `balance-api` | 백엔드 (Spring Boot) |
| `balance-web` | 프론트엔드 (React) |

각 프로젝트를 GitHub 저장소에 push합니다.

```bash
# balance-api 프로젝트에서
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/{본인계정}/balance-api.git
git push -u origin main

# balance-web 프로젝트에서
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/{본인계정}/balance-web.git
git push -u origin main
```

## GitHub Actions란?

GitHub에서 제공하는 **CI/CD 자동화 도구**입니다. 코드를 push하면 자동으로 빌드, 테스트, 배포를 실행합니다.

```
수동 배포:  코드 수정 → 빌드 → ECR push → SSH 접속 → docker pull → docker run (매번 반복)
자동 배포:  코드 수정 → git push → GitHub Actions가 위 과정을 자동으로 실행
```

## 핵심 개념

| 개념 | 설명 |
|------|------|
| **Workflow** | 자동화할 작업 전체를 정의한 YAML 파일 |
| **Trigger** | Workflow가 실행되는 조건 (예: push, PR 생성) |
| **Job** | Workflow 안에서 실행되는 작업 단위 |
| **Step** | Job 안에서 순서대로 실행되는 개별 명령 |
| **Secrets** | 비밀번호, API 키 등 코드에 노출하면 안 되는 값 |

```
Workflow (.github/workflows/deploy.yml)
  └── Job (deploy)
       ├── Step 1: 코드 체크아웃
       ├── Step 2: JAR 빌드
       ├── Step 3: Docker 이미지 빌드
       ├── Step 4: ECR push
       └── Step 5: EC2에 SSH 접속 → docker pull → docker run
```

## Workflow 파일 위치

프로젝트 루트의 `.github/workflows/` 디렉토리에 YAML 파일을 생성하면 GitHub가 자동으로 인식합니다.

```
balance-api/
├── .github/
│   └── workflows/
│       └── deploy.yml    ← 여기에 생성
├── Dockerfile
├── build.gradle.kts
└── src/
```

## 백엔드 자동 배포

`main` 브랜치에 push하면 자동으로 백엔드를 배포하는 Workflow입니다.

```yaml
# .github/workflows/deploy.yml

name: Deploy Backend

on:
  push:
    branches: [main]        # main 브랜치에 push할 때 실행

jobs:
  deploy:
    runs-on: ubuntu-latest   # GitHub에서 제공하는 Ubuntu 서버에서 실행

    steps:
      # 1. 코드 체크아웃
      - uses: actions/checkout@v4

      # 2. Java 21 설정
      - uses: actions/setup-java@v4
        with:
          distribution: corretto
          java-version: 21

      # 3. JAR 빌드
      - run: ./gradlew build

      # 4. AWS 인증
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      # 5. ECR 로그인
      - uses: aws-actions/amazon-ecr-login@v2

      # 6. Docker 이미지 빌드 + ECR push
      - run: |
          docker build --platform linux/amd64 -t ${{ secrets.ECR_URI }}:latest .
          docker push ${{ secrets.ECR_URI }}:latest

      # 7. EC2에 SSH 접속 → 배포
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin ${{ secrets.ECR_URI }}
            docker pull ${{ secrets.ECR_URI }}:latest
            docker stop balance-api || true
            docker rm balance-api || true
            docker run -d --name balance-api \
              -p 8080:8080 \
              -e DB_HOST=${{ secrets.DB_HOST }} \
              -e DB_USERNAME=${{ secrets.DB_USERNAME }} \
              -e DB_PASSWORD=${{ secrets.DB_PASSWORD }} \
              -e SPRING_PROFILES_ACTIVE=prod \
              ${{ secrets.ECR_URI }}:latest
```

> 수동 배포에서 직접 타이핑했던 명령어가 그대로 Step으로 들어가 있습니다.

## GitHub Secrets 설정

Workflow에서 사용하는 `${{ secrets.XXX }}` 값을 GitHub에 등록해야 합니다. 코드에 직접 넣으면 노출되므로 Secrets로 관리합니다.

1. GitHub → 해당 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 아래 값을 각각 등록:

| Secret 이름 | 값 | 확인 위치 |
|------------|-----|----------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | 인프라 셋업에서 생성한 값 |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | 인프라 셋업에서 생성한 값 |
| `ECR_URI` | ECR 주소 | CloudFormation Outputs의 `ECRUri` |
| `EC2_HOST` | EC2 공인 IP | CloudFormation Outputs의 `EC2PublicIP` |
| `EC2_SSH_KEY` | `.pem` 파일 내용 전체 | 키 페어 생성 시 다운로드한 파일 |
| `DB_HOST` | RDS 주소 | CloudFormation Outputs의 `RDSEndpoint` |
| `DB_USERNAME` | `admin` | CloudFormation에서 지정한 값 |
| `DB_PASSWORD` | `1234qwer` | CloudFormation에서 지정한 값 |

> `EC2_SSH_KEY`는 `.pem` 파일을 텍스트 에디터로 열어서 `-----BEGIN RSA PRIVATE KEY-----`부터 `-----END RSA PRIVATE KEY-----`까지 전체를 복사합니다.

## 동작 확인

1. 코드를 수정하고 `main` 브랜치에 push
2. GitHub → 해당 저장소 → **Actions** 탭에서 Workflow 실행 확인
3. 모든 Step이 녹색 체크이면 배포 성공
4. `https://api.{본인영문이름}.cecil1018.click/api/health`에서 확인

## 프론트엔드 자동 배포

프론트엔드도 동일한 방식으로 자동화할 수 있습니다.

```yaml
# balance-web/.github/workflows/deploy.yml

name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install
      - run: npm run build

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      # S3 업로드
      - run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete

      # CloudFront 캐시 무효화
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

| Secret 이름 | 값 |
|------------|-----|
| `S3_BUCKET` | S3 버킷 이름 |
| `CLOUDFRONT_ID` | CloudFront Distribution ID |

## 정리

```
수동 배포:
  로컬에서 빌드 → ECR push → SSH 접속 → docker pull → docker run
  매번 5~10분 소요, 실수 가능

자동 배포 (GitHub Actions):
  git push → 끝
  GitHub Actions가 동일한 과정을 자동으로 실행
```
