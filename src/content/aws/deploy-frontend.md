# 프론트엔드 배포

React 앱은 `npm run build`로 정적 파일(HTML, CSS, JS)을 생성하고, 이 파일을 S3에 업로드하여 CloudFront로 서빙합니다.

```
npm run build → dist/ 생성 → S3 업로드 → CloudFront 캐시 무효화
```

## S3 + CloudFront 생성

프론트엔드 인프라는 AWS 콘솔에서 직접 생성합니다.

### 1. S3 버킷 생성

1. AWS 콘솔 → **S3** 검색 → 클릭
2. **버킷 만들기** 클릭
3. 버킷 이름: `balance-game-web-{본인영문이름}` (예: `balance-game-web-martin`)
4. 리전: **아시아 태평양 (서울) ap-northeast-2**
5. 나머지 기본값 유지 → **버킷 만들기** 클릭

> S3 버킷 이름은 전 세계에서 고유해야 합니다. 중복되면 다른 이름을 사용하세요.

### 2. CloudFront 배포 생성

1. AWS 콘솔 → **CloudFront** 검색 → 클릭
2. **배포 생성** 클릭
3. 설정값:

| 항목 | 값 |
|------|-----|
| Price plan | **Pay as you go** 선택 |
| 원본 도메인 | 방금 만든 S3 버킷 선택 |
| 원본 액세스 | **원본 액세스 제어 설정** 선택 → **제어 설정 생성** 클릭 → 기본값으로 생성 |
| Distribution name | `balance-game-web` |
| Route 53 managed domain | `web.{본인영문이름}.cecil1018.click` (예: `web.martin.cecil1018.click`) |
| 나머지 | 기본값 유지 |

> **주의**: Free plan은 구독 요금제이므로 강의 후 바로 삭제할 수 없습니다. 반드시 **Pay as you go**를 선택하세요.

4. **배포 생성** 클릭

### 3. Route 53 레코드 등록

CloudFront 배포와 도메인을 연결합니다.

1. AWS 콘솔 → **Route 53** → 본인의 호스팅 영역 클릭 (예: `martin.cecil1018.click`)
2. **레코드 생성** 클릭
3. 설정값:

| 항목 | 값 |
|------|-----|
| 레코드 이름 | `web` |
| 레코드 유형 | **A** |
| **별칭** 토글 | 활성화 |
| 트래픽 라우팅 대상 | **CloudFront 배포에 대한 별칭** → 방금 생성한 배포 선택 |

4. **레코드 생성** 클릭

### 4. 기본 루트 객체 설정

배포 생성 후 기본 루트 객체를 설정합니다.

1. CloudFront → 해당 배포 → **설정** 탭 → **편집**
2. **기본 루트 객체**: `index.html` 입력 → **변경 사항 저장**

### 5. SPA 에러 처리 설정

React Router를 사용하는 SPA는 새로고침 시 403/404 에러가 발생할 수 있습니다. CloudFront에서 에러 페이지를 설정합니다.

1. CloudFront → 해당 배포 → **오류 페이지** 탭
2. **사용자 정의 오류 응답 생성** 클릭
3. 아래 두 가지를 각각 추가:

| HTTP 오류 코드 | 응답 페이지 경로 | HTTP 응답 코드 |
|---------------|----------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

> React Router가 클라이언트에서 라우팅을 처리하기 위해 필요합니다. 서버에 존재하지 않는 경로도 `index.html`을 반환하면 React Router가 처리합니다.

## 수동 배포

### 0. 환경 변수 설정

프로젝트 루트에 `.env.production` 파일을 생성합니다.

```
# .env.production - 배포 환경용
VITE_API_BASE_URL=https://api.{본인영문이름}.cecil1018.click
```

Vite는 실행 모드에 따라 다른 `.env` 파일을 로드합니다.

| 명령어 | 모드 | 로드되는 파일 | API URL |
|--------|------|-------------|---------|
| `npm run dev` | development | `.env` | `http://localhost:8080` |
| `npm run build` | production | `.env.production` | `https://api.{도메인}` |

> `.env`를 수정할 필요 없이, `npm run build` 시 자동으로 `.env.production` 값이 적용됩니다.

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

> Distribution ID는 CloudFront 콘솔에서 확인합니다.

### 4. 확인

`https://web.{본인영문이름}.cecil1018.click`에 접속하여 배포된 화면을 확인합니다.

> 이 과정을 매번 수동으로 하는 것은 번거롭습니다. **자동 배포** 섹션에서 GitHub Actions로 자동화합니다.
