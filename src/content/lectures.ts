import prereqAccounts from "./prerequisites/accounts.md?raw";
import prereqIde from "./prerequisites/ide.md?raw";
import prereqRuntime from "./prerequisites/runtime.md?raw";
import prereqTools from "./prerequisites/tools.md?raw";
import introOverview from "./intro/overview.md?raw";
import startModernFramework from "./intro/modern-framework.md?raw";
import startAwsSetup from "./intro/aws-setup.md?raw";
import springIntro from "./spring-boot/intro.md?raw";
import springArchitecture from "./spring-boot/architecture.md?raw";
import springSetup from "./spring-boot/setup.md?raw";
import springApi from "./spring-boot/api.md?raw";
import springException from "./spring-boot/exception.md?raw";
import springReference from "./spring-boot/reference.md?raw";
import reactIntro from "./react/intro.md?raw";
import reactArchitecture from "./react/architecture.md?raw";
import reactSetup from "./react/setup.md?raw";
import reactComponent from "./react/component.md?raw";
import awsOverview from "./aws/overview.md?raw";
import githubWorkflow from "./github/workflow.md?raw";

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
      { id: "prereq-accounts", title: "계정 만들기", content: prereqAccounts },
      { id: "prereq-ide", title: "IDE 설치", content: prereqIde },
      { id: "prereq-runtime", title: "런타임 설치", content: prereqRuntime },
      { id: "prereq-tools", title: "개발 도구 설치", content: prereqTools },
    ],
  },
  {
    id: "intro",
    title: "강의 소개",
    icon: "📋",
    sections: [
      { id: "intro-overview", title: "개요", content: introOverview },
    ],
  },
  {
    id: "start",
    title: "강의 시작",
    icon: "🚩",
    sections: [
      { id: "start-modern-framework", title: "프레임워크의 핵심 원칙", content: startModernFramework },
      { id: "start-aws-setup", title: "AWS 인프라 사전 셋업", content: startAwsSetup },
    ],
  },
  {
    id: "spring-boot",
    title: "Backend (Spring Boot)",
    icon: "🍃",
    sections: [
      { id: "spring-intro", title: "Spring Boot란?", content: springIntro },
      { id: "spring-architecture", title: "핵심 구조", content: springArchitecture },
      { id: "spring-setup", title: "프로젝트 생성", content: springSetup },
      { id: "spring-api", title: "밸런스 게임 API 만들기", content: springApi },
      { id: "spring-exception", title: "예외 핸들링", content: springException },
      { id: "spring-reference", title: "어노테이션 & Spring Data JPA", content: springReference },
    ],
  },
  {
    id: "react",
    title: "Frontend (React)",
    icon: "⚛️",
    sections: [
      { id: "react-intro", title: "React란?", content: reactIntro },
      { id: "react-architecture", title: "핵심 구조", content: reactArchitecture },
      { id: "react-setup", title: "프로젝트 생성", content: reactSetup },
      { id: "react-component", title: "컴포넌트 작성", content: reactComponent },
    ],
  },
  {
    id: "aws",
    title: "AWS 인프라 & 배포",
    icon: "☁️",
    sections: [
      { id: "aws-overview", title: "배포 전략", content: awsOverview },
    ],
  },
  {
    id: "github",
    title: "자동 배포 (CI/CD)",
    icon: "🚀",
    sections: [
      { id: "github-workflow", title: "GitHub Actions", content: githubWorkflow },
    ],
  },
];
