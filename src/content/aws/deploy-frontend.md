# 프론트엔드 배포

React 앱은 `npm run build`로 정적 파일(HTML, CSS, JS)을 생성하고, 이 파일을 S3에 업로드하여 CloudFront로 서빙합니다.

```
npm run build → dist/ 생성 → S3 업로드 → CloudFront 캐시 무효화
```

## 수동 배포

React 빌드 결과물을 S3에 업로드하고 CloudFront 캐시를 무효화합니다.

### 0. 환경 변수 설정

로컬 개발에서는 `.env`의 API URL이 `localhost:8080`이었습니다. 배포 시에는 **실제 백엔드 URL**로 변경해야 합니다.

```
# .env - 배포용으로 변경
VITE_API_BASE_URL=https://{백엔드 서비스 URL}
```

> Vite는 `npm run build` 시점에 `.env` 값을 코드에 삽입합니다. 따라서 빌드 **전에** URL을 변경해야 합니다. 배포 후 `.env`를 바꿔도 이미 빌드된 파일에는 반영되지 않습니다.

### 1. 빌드

```bash
# balance-web 프로젝트에서
npm run build
```

`dist/` 폴더에 배포용 파일이 생성됩니다.

```
dist/
├── index.html
└── assets/
    ├── index-abc123.js
    └── index-def456.css
```

### 2. S3 업로드

CloudFormation Outputs에서 확인한 S3 버킷 이름을 사용합니다.

```bash
aws s3 sync dist/ s3://{S3 버킷 이름} --delete
```

| 옵션 | 설명 |
|------|------|
| `sync` | 변경된 파일만 업로드 (전체 업로드보다 빠름) |
| `--delete` | S3에만 있고 로컬에 없는 파일 삭제 (이전 빌드 잔여물 정리) |

### 3. CloudFront 캐시 무효화

CloudFront는 파일을 캐시하므로, 새 배포 후 캐시를 무효화해야 변경사항이 반영됩니다.

```bash
aws cloudfront create-invalidation \
  --distribution-id {CloudFront Distribution ID} \
  --paths "/*"
```

### 4. 확인

CloudFormation Outputs의 `WebUrl`에 접속하여 배포된 화면을 확인합니다.

> 이 과정을 매번 수동으로 하는 것은 번거롭습니다. **자동 배포** 섹션에서 GitHub Actions로 자동화합니다.
