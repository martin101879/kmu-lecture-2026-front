# GitHub 협업 워크플로우

## 브랜치 전략

```
main (배포용)
 └── develop (개발 통합)
      ├── feature/login    (기능 개발)
      ├── feature/post     (기능 개발)
      └── fix/post-bug     (버그 수정)
```

## 기본 워크플로우

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/login

# 2. 작업 & 커밋
git add .
git commit -m "feat: 로그인 기능 구현"

# 3. 원격에 푸시
git push origin feature/login

# 4. GitHub에서 Pull Request 생성

# 5. 코드 리뷰 후 merge
```

## 커밋 메시지 컨벤션

| 접두사 | 용도 |
|--------|------|
| `feat:` | 새로운 기능 |
| `fix:` | 버그 수정 |
| `docs:` | 문서 수정 |
| `refactor:` | 리팩토링 |
| `test:` | 테스트 추가 |

## 핵심 포인트

- **PR(Pull Request)** 을 통해 코드 리뷰를 진행하세요
- **절대 main 브랜치에 직접 push하지 마세요**
- 커밋은 작은 단위로 자주 하는 것이 좋습니다
