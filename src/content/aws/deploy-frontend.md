# 프론트엔드 배포

## 프론트엔드 배포 방식

React 앱은 `npm run build`로 정적 파일(HTML, CSS, JS)을 생성합니다. 이 파일들을 서빙하기만 하면 됩니다.

| 서비스 | 설명 | 적합한 경우 |
|--------|------|-----------|
| **S3 + CloudFront** | 정적 파일 호스팅 + CDN | 가장 일반적, 저렴 |
| Vercel | Git push만으로 자동 배포 | 개인 프로젝트, 프로토타입 |
| Netlify | Vercel과 유사 | 개인 프로젝트 |
| EC2/Nginx | 서버에서 직접 서빙 | 백엔드와 같은 서버에서 운영 |

이 강의에서는 **S3 + CloudFront**를 사용합니다.

---

## 수동 배포

React 빌드 결과물을 S3에 업로드하고 CloudFront 캐시를 무효화합니다.

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
