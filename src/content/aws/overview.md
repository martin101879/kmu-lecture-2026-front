# AWS 인프라 & 배포

## 배포란?

개발한 애플리케이션을 사용자가 접근할 수 있는 서버에 올리는 것입니다.

```
로컬 개발:     localhost:8080 (내 PC에서만 접근 가능)
    ↓ 배포
서버 배포:     https://api.example.com (누구나 접근 가능)
```

## 서버 기반 vs 서버리스

AWS 배포 방식은 크게 **서버 기반**과 **서버리스**로 나뉩니다.

| | 서버 기반 | 서버리스 |
|---|---|---|
| 서버 관리 | 직접 관리 (OS, 패치 등) | AWS가 관리 |
| 과금 | 서버가 켜져 있는 동안 과금 | 사용한 만큼만 과금 |
| 스케일링 | 수동 또는 설정 필요 | 자동 |
| 대표 서비스 | EC2, ECS on EC2 | Fargate, Lambda |

## AWS 배포 옵션

### 서버 기반

#### EC2

가장 로우레벨한 방식입니다. 가상 서버(Linux)를 빌려서 **직접 관리**합니다. OS 위에서 무엇이든 할 수 있습니다.

```
방법 1: JAR 직접 실행
  EC2에 Java 설치 → JAR 파일 전송 → java -jar 실행

방법 2: Docker 실행
  EC2에 Docker 설치 → 이미지 pull → docker run 실행
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | 직접 관리 |
|---------|------|----------|
| EC2 Instance | 가상 서버 | OS 설정, 프로그램 설치, 보안 패치 |
| Security Group | 방화벽 | 포트 열기/닫기 |
| Elastic IP (선택) | 고정 IP | 없으면 재시작 시 IP 변경 |
| ALB (선택) | 로드 밸런서 | HTTPS, 헬스 체크 설정 |

> 자유도가 가장 높지만 관리할 것도 가장 많습니다. Linux OS 관리, 프로그램 설치, 보안 패치 등을 모두 직접 해야 합니다.

#### Elastic Beanstalk

코드를 업로드하면 AWS가 **EC2, ALB, Auto Scaling을 자동 구성**합니다.

```
JAR 업로드 → Beanstalk이 알아서 인프라 구성 + 배포
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | 직접 관리 |
|---------|------|----------|
| Beanstalk Environment | 배포 환경 | 환경 설정 (Java 버전, 인스턴스 타입) |
| S3 (자동) | 소스 코드 저장 | 자동 관리 |

> EC2, ALB, Auto Scaling 등은 Beanstalk이 자동으로 생성/관리합니다. 편리하지만 세부 제어가 제한적입니다.

### 컨테이너 기반

#### ECS (Elastic Container Service)

Docker 컨테이너를 실행합니다. 실행 방식에 따라 **EC2 모드**와 **Fargate 모드**가 있습니다.

```
Docker 이미지 빌드 → ECR에 push → ECS가 컨테이너 실행
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | EC2 모드 | Fargate 모드 |
|---------|------|---------|-------------|
| ECR | Docker 이미지 저장소 | 직접 관리 | 직접 관리 |
| ECS Cluster | 컨테이너 실행 환경 | 직접 관리 | 직접 관리 |
| Task Definition | 컨테이너 설정 | 직접 관리 | 직접 관리 |
| ECS Service | 태스크 실행/관리 | 직접 관리 | 직접 관리 |
| EC2 Instance | 컨테이너가 실행될 서버 | **직접 관리** | **관리 불필요** |
| ALB | 로드 밸런서 | 직접 관리 | 직접 관리 |

> **Fargate**를 사용하면 서버(EC2) 관리가 필요 없습니다. Docker 이미지만 준비하면 됩니다.

#### ECS Express Mode

2025년 말 출시된 ECS의 새 모드입니다. 기존 ECS에서 직접 구성해야 했던 ALB, HTTPS, Auto Scaling 등을 **자동으로 생성**합니다.

```
컨테이너 이미지 + IAM Role 2개 입력 → 나머지 전부 자동
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | 직접 관리 |
|---------|------|----------|
| ECR | Docker 이미지 저장소 | 직접 관리 |
| ECS Cluster | 컨테이너 실행 환경 | 직접 관리 |
| Task Definition | 컨테이너 설정 | 직접 관리 |
| IAM Role (2개) | 실행 권한 + 인프라 생성 권한 | 직접 관리 |
| ALB | 로드 밸런서 | **자동 생성** |
| HTTPS + 도메인 | SSL 인증서 + URL | **자동 생성** |
| Auto Scaling | 트래픽 기반 스케일링 | **자동 생성** |
| Security Group | 네트워크 접근 제어 | **자동 생성** |

> 기존 ECS Fargate의 유연함을 유지하면서, App Runner 수준의 간편함을 제공합니다. 자동 생성된 리소스도 직접 수정할 수 있습니다.

#### EKS (Elastic Kubernetes Service)

**Kubernetes**를 AWS에서 실행합니다. 컨테이너 오케스트레이션의 업계 표준인 Kubernetes를 사용하여 대규모 컨테이너를 관리합니다.

```
Docker 이미지 빌드 → ECR에 push → Kubernetes가 컨테이너 관리
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | 직접 관리 |
|---------|------|----------|
| EKS Cluster | Kubernetes 클러스터 | 클러스터 설정 |
| ECR | Docker 이미지 저장소 | 직접 관리 |
| Node Group / Fargate | 컨테이너 실행 환경 | 노드 관리 또는 Fargate |
| kubectl + YAML | 배포 설정 | Deployment, Service, Ingress 등 |
| ALB Ingress Controller | 로드 밸런서 | 직접 설정 |

> Kubernetes 생태계(Helm, ArgoCD 등)를 활용할 수 있어 대규모 마이크로서비스에 적합하지만, 학습 곡선이 높고 소규모 프로젝트에는 과합니다.

### 서버리스

#### Lambda

서버 없이 **함수 단위**로 실행됩니다. 요청이 있을 때만 실행되고, 없으면 비용이 0입니다.

```
함수 코드 작성 → Lambda에 배포 → API Gateway로 HTTP 연결
```

직접 조작해야 하는 AWS 컴포넌트:

| 컴포넌트 | 역할 | 직접 관리 |
|---------|------|----------|
| Lambda Function | 함수 실행 | 코드 배포 |
| API Gateway | HTTP → Lambda 연결 | 라우팅 설정 |

> 서버가 완전히 없지만, Spring Boot와 맞지 않습니다 (Cold Start 문제, 실행 시간 15분 제한).

## 비교 요약

| | EC2 | Elastic Beanstalk | ECS Fargate | ECS Express | EKS | Lambda |
|---|---|---|---|---|---|---|
| 서버 관리 | 직접 관리 | 반자동 | 서버리스 | **서버리스** | 선택 | 완전 서버리스 |
| 배포 방식 | JAR 직접 복사 | JAR 업로드 | Docker | **Docker** | Docker | 함수 코드 |
| 직접 관리 | 많음 | 적음 | 중간 | **적음** | 많음 | 적음 |
| ALB/HTTPS | 직접 설정 | 자동 | 직접 설정 | **자동** | 직접 설정 | API Gateway |
| 스케일링 | 수동 | 자동 | 자동 | **자동** | 자동 | 자동 |
| Spring Boot | O | O | O | **O** | O | X |
| 적합한 규모 | 소규모 | 중규모 | 중~대규모 | **중규모** | 대규모 | 이벤트 처리 |

## 프론트엔드 배포 옵션

React 앱은 `npm run build`로 **정적 파일** (HTML, CSS, JS)을 생성합니다. 이 파일을 사용자에게 서빙하는 방법은 여러 가지가 있습니다.

### 백엔드 서버에 포함

빌드 결과물을 백엔드 프로젝트에 넣어 하나의 서버에서 서빙합니다.

```
npm run build → dist/ 파일을 Spring Boot의 static/ 폴더에 복사
→ Spring Boot가 API + 정적 파일 모두 서빙
```

| 장점 | 단점 |
|------|------|
| 서버 하나로 운영 | 프론트/백엔드 배포가 항상 함께 |
| CORS 불필요 (같은 서버) | 프론트만 수정해도 백엔드 재배포 필요 |
| 구성이 단순 | CDN 없이 느릴 수 있음 |

### 웹서버 배포

Nginx 같은 웹서버에서 정적 파일을 서빙합니다. EC2에 직접 설치하거나 Docker 이미지로 실행합니다.

```
방법 1: EC2에 Nginx 설치 → dist/ 파일 복사
방법 2: Nginx Docker 이미지에 dist/ 파일 포함 → ECS에서 실행
```

| 장점 | 단점 |
|------|------|
| 세부 설정 가능 (캐시, 리다이렉트 등) | 서버 관리 필요 |
| Docker로 실행 가능 | CDN 직접 구성 필요 |

### S3 + CloudFront

정적 파일을 S3에 업로드하고 CloudFront (CDN)로 전 세계에 배포합니다.

```
npm run build → dist/ 파일을 S3에 업로드 → CloudFront가 캐시 + HTTPS 제공
```

| 장점 | 단점 |
|------|------|
| 서버 관리 불필요 | 프론트/백엔드 도메인이 분리됨 (CORS 필요) |
| CDN으로 전 세계에서 빠름 | |
| HTTPS 자동 | |
| 비용이 매우 저렴 | |

### 비교 요약

| | 백엔드에 포함 | 웹서버 (Nginx) | S3 + CloudFront |
|---|---|---|---|
| 서버 관리 | 백엔드와 동일 | 직접 관리 | **불필요** |
| CDN | 없음 | 별도 구성 | **자동** |
| HTTPS | 백엔드 설정 | 직접 설정 | **자동** |
| 프론트/백엔드 분리 배포 | 불가 | 가능 | **가능** |
| CORS | 불필요 | 필요할 수 있음 | 필요 |
| 적합한 경우 | 소규모, 프로토타입 | 커스텀 서버 설정 필요 시 | **대부분의 SPA** |

## 이 강의에서의 선택

| 영역 | 선택 | 이유 |
|------|------|------|
| 백엔드 | **ECS Express Mode** | Docker 연결, 서버 관리 불필요, ALB/HTTPS 자동 |
| 프론트엔드 | **S3 + CloudFront** | 서버 관리 불필요, CDN + HTTPS 자동, 저렴 |
| 데이터베이스 | **RDS (MySQL)** | 관리형 DB, 백업 자동 |

### 전체 아키텍처

![전체 아키텍처](/images/aws-architecture.svg)

```
사용자 → CloudFront → S3 (React 정적 파일)
   ↓
사용자 → ALB → ECS Express Mode (Spring Boot API)
                      ↓
                    RDS (MySQL)
```

> 이 인프라는 강의 시작 시 **CloudFormation**으로 자동 생성됩니다.
