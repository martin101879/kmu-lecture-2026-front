export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Lecture {
  id: string;
  title: string;
  icon: string;
  sections: Section[];
}

export const lectures: Lecture[] = [
  {
    id: "prerequisites",
    title: "사전 준비",
    icon: "🔧",
    sections: [
      {
        id: "prereq-accounts",
        title: "계정 만들기",
        content: `# 계정 만들기

강의 진행을 위해 아래 서비스의 계정이 필요합니다.

## AWS 계정

AWS 계정을 생성하고 **결제 카드를 등록**해주세요.

- 가입: [https://aws.amazon.com](https://aws.amazon.com) → "AWS 계정 생성"
- 카드 등록이 필요하지만, 수업 시간 내 사용 비용은 **커피 한 잔 값 이하**입니다
- 프리티어를 활용하면 대부분의 비용이 발생하지 않습니다

> **주의**: 가입 시 리전(Region)은 \`아시아 태평양 (서울) ap-northeast-2\`로 설정해주세요.

## GitHub 계정

- 가입: [https://github.com](https://github.com) → "Sign up"
- 이미 계정이 있다면 그대로 사용하시면 됩니다
`,
      },
      {
        id: "prereq-ide",
        title: "IDE 설치",
        content: `# IDE 설치

## VS Code

프론트엔드(React) 개발에 사용합니다.

- 다운로드: [https://code.visualstudio.com](https://code.visualstudio.com)
- Windows, macOS 모두 설치 파일 다운로드 후 실행하면 됩니다

## IntelliJ IDEA

백엔드(Spring Boot) 개발에 사용합니다.

- 다운로드: [https://www.jetbrains.com/idea/download](https://www.jetbrains.com/idea/download)

아래 두 가지 방법 중 하나를 선택하세요:

| 방법 | 설명 |
|------|------|
| **30일 무료 체험판** | Ultimate 버전을 바로 설치하고 Free Trial로 시작 |
| **교육용 라이선스** | \`.ac.kr\` 학교 이메일로 인증하면 졸업 전까지 무료 사용 가능 |

- 교육용 라이선스 신청: [https://www.jetbrains.com/community/education](https://www.jetbrains.com/community/education)

> 우선 **30일 무료 체험판**으로 설치해오시고, 이후 교육용 라이선스를 신청해서 정식 버전으로 전환하시면 됩니다.

## DataGrip

데이터베이스 관리 도구입니다.

- 다운로드: [https://www.jetbrains.com/datagrip/download](https://www.jetbrains.com/datagrip/download)

IntelliJ와 동일하게 **30일 무료 체험판** 또는 **교육용 라이선스**로 사용할 수 있습니다.

> JetBrains 교육용 라이선스는 IntelliJ, DataGrip을 포함한 모든 JetBrains 제품에 적용됩니다.
> 한 번만 신청하면 됩니다.
`,
      },
      {
        id: "prereq-runtime",
        title: "런타임 설치",
        content: `# 런타임 설치

## Java 21 이상

Spring Boot 실행에 필요합니다.

### Windows

1. [https://adoptium.net](https://adoptium.net) 에서 **Temurin JDK 21** 다운로드
2. \`.msi\` 설치 파일 실행
3. 설치 중 **"Set JAVA_HOME variable"** 옵션을 반드시 체크

설치 확인:
\`\`\`powershell
java -version
\`\`\`

### macOS

Homebrew를 사용합니다:
\`\`\`bash
brew install openjdk@21
\`\`\`

또는 [https://adoptium.net](https://adoptium.net) 에서 \`.pkg\` 파일을 다운로드하여 설치합니다.

설치 확인:
\`\`\`bash
java -version
\`\`\`

---

## Node.js 22 이상

React 개발에 필요합니다.

### Windows

1. [https://nodejs.org](https://nodejs.org) 에서 **LTS 버전** 다운로드
2. \`.msi\` 설치 파일 실행 (기본 옵션 그대로 진행)

설치 확인:
\`\`\`powershell
node -v
npm -v
\`\`\`

### macOS

\`\`\`bash
brew install node
\`\`\`

또는 [https://nodejs.org](https://nodejs.org) 에서 \`.pkg\` 파일을 다운로드하여 설치합니다.

설치 확인:
\`\`\`bash
node -v
npm -v
\`\`\`
`,
      },
      {
        id: "prereq-tools",
        title: "개발 도구 설치",
        content: `# 개발 도구 설치

## Git

소스 코드 버전 관리 도구입니다.

### Windows

1. [https://git-scm.com/download/win](https://git-scm.com/download/win) 에서 다운로드
2. 설치 파일 실행 (기본 옵션 그대로 진행)

설치 확인:
\`\`\`powershell
git --version
\`\`\`

### macOS

macOS에는 Xcode Command Line Tools에 Git이 포함되어 있습니다:
\`\`\`bash
git --version
\`\`\`

설치되어 있지 않다면:
\`\`\`bash
xcode-select --install
\`\`\`

또는 Homebrew로 최신 버전을 설치할 수 있습니다:
\`\`\`bash
brew install git
\`\`\`

---

## Docker Desktop

컨테이너 기반 개발 및 배포에 사용합니다.

### Windows

1. [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) 에서 **Docker Desktop for Windows** 다운로드
2. 설치 파일 실행
3. 설치 완료 후 **재부팅**이 필요할 수 있습니다
4. WSL 2 백엔드를 사용하므로, 설치 중 WSL 2 설치 안내가 나오면 따라 진행하세요

설치 확인:
\`\`\`powershell
docker --version
\`\`\`

### macOS

1. [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) 에서 **Docker Desktop for Mac** 다운로드
2. \`.dmg\` 파일 실행 후 Applications 폴더로 드래그
3. Docker Desktop 실행

> Apple Silicon(M1/M2/M3/M4) Mac은 **Apple Silicon** 버전을, Intel Mac은 **Intel** 버전을 다운로드하세요.

설치 확인:
\`\`\`bash
docker --version
\`\`\`

---

## PowerShell (Windows만 해당)

Windows에서 PowerShell이 설치되어 있지 않은 경우에만 설치가 필요합니다.

확인 방법 - 시작 메뉴에서 "PowerShell"을 검색하여 실행되면 이미 설치되어 있는 것입니다.

설치되어 있지 않은 경우:
1. [https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases) 에서 최신 \`.msi\` 파일 다운로드
2. 설치 파일 실행
`,
      },
    ],
  },
  {
    id: "intro",
    title: "강의 소개",
    icon: "📋",
    sections: [
      {
        id: "intro-overview",
        title: "개요",
        content: `# 캡스톤 디자인 개발 실습

## 강의 목표

이 강의는 **계명대학교 컴퓨터공학과** 학생들이 졸업 작품(캡스톤 디자인)을 준비할 수 있도록,
실제 서비스 개발부터 배포까지 한 싸이클을 경험하는 것을 목표로 합니다.

## 다루는 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot |
| Frontend | React |
| Infra | AWS |
| 협업 | GitHub |

## 강의 흐름

1. **프로젝트 셋업** - 개발 환경 구성
2. **백엔드 개발** - Spring Boot REST API
3. **프론트엔드 개발** - React SPA
4. **배포** - AWS를 활용한 서비스 배포
5. **협업** - GitHub을 활용한 팀 개발

> 2시간이라는 짧은 시간 동안 전체 개발 프로세스를 압축해서 경험합니다.
> 완벽한 이해보다는 **전체 흐름을 파악**하는 것이 중요합니다.
`,
      },
    ],
  },
  {
    id: "spring-boot",
    title: "Spring Boot",
    icon: "🍃",
    sections: [
      {
        id: "spring-setup",
        title: "프로젝트 생성",
        content: `# Spring Boot 프로젝트 생성

## Spring Initializr

[start.spring.io](https://start.spring.io)에서 프로젝트를 생성합니다.

### 설정값

- **Project**: Gradle - Kotlin
- **Language**: Java
- **Spring Boot**: 3.x.x (최신 stable)
- **Group**: \`ac.kr.kmu\`
- **Artifact**: \`capstone\`
- **Dependencies**:
  - Spring Web
  - Spring Data JPA
  - H2 Database

## 프로젝트 구조

\`\`\`
src/
├── main/
│   ├── java/ac/kr/kmu/capstone/
│   │   ├── CapstoneApplication.java
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   └── resources/
│       └── application.yml
└── test/
\`\`\`

> 강의에서는 간단한 CRUD API를 만들어 봅니다.
`,
      },
      {
        id: "spring-api",
        title: "REST API 만들기",
        content: `# REST API 만들기

## Controller 작성

\`\`\`java
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostResponse> getPosts() {
        return postService.findAll();
    }

    @PostMapping
    public PostResponse createPost(@RequestBody PostRequest request) {
        return postService.create(request);
    }
}
\`\`\`

## Entity 작성

\`\`\`java
@Entity
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    // getters, setters
}
\`\`\`

## 핵심 포인트

- \`@RestController\`: JSON 응답을 반환하는 컨트롤러
- \`@RequestMapping\`: URL 경로 매핑
- \`@GetMapping\` / \`@PostMapping\`: HTTP 메서드 매핑
- 실제 필드에서는 **DTO 패턴**을 사용해 Entity를 직접 노출하지 않습니다
`,
      },
    ],
  },
  {
    id: "react",
    title: "React",
    icon: "⚛️",
    sections: [
      {
        id: "react-setup",
        title: "프로젝트 생성",
        content: `# React 프로젝트 생성

## Vite로 프로젝트 생성

\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
\`\`\`

## 왜 Vite인가?

- **빠른 개발 서버**: ESM 기반 HMR (Hot Module Replacement)
- **간단한 설정**: 최소한의 config로 시작 가능
- **TypeScript 지원**: 별도 설정 없이 바로 사용

## 프로젝트 구조

\`\`\`
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 단위 컴포넌트
├── hooks/          # 커스텀 훅
├── api/            # API 호출 함수
├── App.tsx         # 루트 컴포넌트
└── main.tsx        # 엔트리 포인트
\`\`\`
`,
      },
      {
        id: "react-component",
        title: "컴포넌트 작성",
        content: `# React 컴포넌트 작성

## 함수형 컴포넌트

\`\`\`tsx
interface PostListProps {
  posts: Post[];
}

function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p>게시글이 없습니다.</p>;
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

## API 연동 (fetch)

\`\`\`tsx
import { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return <PostList posts={posts} />;
}
\`\`\`

## 핵심 포인트

- **Props**: 부모 → 자식으로 데이터 전달
- **useState**: 컴포넌트 내부 상태 관리
- **useEffect**: 사이드 이펙트 처리 (API 호출 등)
- **key**: 리스트 렌더링 시 고유 식별자 필수
`,
      },
    ],
  },
  {
    id: "aws",
    title: "AWS 배포",
    icon: "☁️",
    sections: [
      {
        id: "aws-overview",
        title: "배포 전략",
        content: `# AWS 배포 전략

## 아키텍처 개요

\`\`\`
[사용자] → [CloudFront] → [S3] (React 정적 파일)
                ↓
          [ALB] → [EC2 / ECS] (Spring Boot API)
                       ↓
                    [RDS] (Database)
\`\`\`

## 캡스톤에서의 간소화 버전

학부 캡스톤에서는 아래와 같이 간소화할 수 있습니다:

| 서비스 | 용도 | 비고 |
|--------|------|------|
| EC2 | 백엔드 서버 | 프리티어 t2.micro |
| S3 | 프론트엔드 호스팅 | 정적 웹 호스팅 |
| RDS | 데이터베이스 | 프리티어 가능 |

## EC2에 Spring Boot 배포

\`\`\`bash
# 1. JAR 빌드
./gradlew bootJar

# 2. EC2에 파일 전송
scp build/libs/capstone-0.0.1-SNAPSHOT.jar ec2-user@<IP>:~/

# 3. EC2에서 실행
ssh ec2-user@<IP>
nohup java -jar capstone-0.0.1-SNAPSHOT.jar &
\`\`\`

> **Tip**: 실무에서는 Docker + ECS 또는 GitHub Actions CI/CD를 사용합니다.
`,
      },
    ],
  },
  {
    id: "github",
    title: "GitHub 협업",
    icon: "🐙",
    sections: [
      {
        id: "github-workflow",
        title: "Git 워크플로우",
        content: `# GitHub 협업 워크플로우

## 브랜치 전략

\`\`\`
main (배포용)
 └── develop (개발 통합)
      ├── feature/login    (기능 개발)
      ├── feature/post     (기능 개발)
      └── fix/post-bug     (버그 수정)
\`\`\`

## 기본 워크플로우

\`\`\`bash
# 1. 기능 브랜치 생성
git checkout -b feature/login

# 2. 작업 & 커밋
git add .
git commit -m "feat: 로그인 기능 구현"

# 3. 원격에 푸시
git push origin feature/login

# 4. GitHub에서 Pull Request 생성

# 5. 코드 리뷰 후 merge
\`\`\`

## 커밋 메시지 컨벤션

| 접두사 | 용도 |
|--------|------|
| \`feat:\` | 새로운 기능 |
| \`fix:\` | 버그 수정 |
| \`docs:\` | 문서 수정 |
| \`refactor:\` | 리팩토링 |
| \`test:\` | 테스트 추가 |

## 핵심 포인트

- **PR(Pull Request)** 을 통해 코드 리뷰를 진행하세요
- **절대 main 브랜치에 직접 push하지 마세요**
- 커밋은 작은 단위로 자주 하는 것이 좋습니다
`,
      },
    ],
  },
];
