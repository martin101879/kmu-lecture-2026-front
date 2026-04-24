# AWS 주요 용어

## 글로벌 인프라

| 용어 | 설명 |
|------|------|
| **Region** | AWS 데이터센터가 위치한 지역. 예: `ap-northeast-2` (서울) |
| **Availability Zone (AZ)** | Region 내의 독립된 데이터센터. 한 Region에 보통 2~3개. 하나가 장애 나도 다른 AZ에서 서비스 유지 |

## 네트워크

| 용어 | 설명 |
|------|------|
| **VPC** | Virtual Private Cloud. AWS 안에 만드는 가상 네트워크. 내 리소스들이 격리된 네트워크에서 동작 |
| **Subnet** | VPC 안의 하위 네트워크. Public Subnet (외부 접근 가능)과 Private Subnet (내부만 접근)으로 구분 |
| **Security Group** | 가상 방화벽. 인바운드(들어오는)/아웃바운드(나가는) 트래픽을 IP, 포트 단위로 제어 |
| **Internet Gateway** | VPC에서 인터넷으로 나가는 출입구. Public Subnet이 외부와 통신하려면 필요 |
| **NAT Gateway** | Private Subnet에서 외부 인터넷에 접근할 때 사용. 외부에서 Private Subnet으로는 접근 불가 |
| **Route Table** | 네트워크 트래픽의 라우팅 규칙. "이 목적지로 가려면 이 게이트웨이를 사용" |
| **Elastic IP** | 고정 공인 IP 주소. EC2에 연결하면 재시작해도 IP 유지 |

## 컴퓨팅

| 용어 | 설명 |
|------|------|
| **EC2** | Elastic Compute Cloud. 가상 서버. Linux/Windows OS를 직접 관리 |
| **Elastic Beanstalk** | 코드만 업로드하면 EC2, ALB, Auto Scaling을 자동 구성해주는 서비스 |
| **ECS** | Elastic Container Service. Docker 컨테이너를 실행/관리하는 서비스 |
| **ECS Fargate** | ECS의 서버리스 모드. EC2 없이 컨테이너만 실행. 서버 관리 불필요 |
| **ECS Express Mode** | ECS의 간편 배포 모드. ALB, HTTPS, Auto Scaling을 자동 생성 |
| **EKS** | Elastic Kubernetes Service. AWS에서 Kubernetes를 실행하는 서비스 |
| **Lambda** | 서버리스 함수 실행. 요청이 있을 때만 실행되고 사용한 만큼만 과금 |
| **ECR** | Elastic Container Registry. Docker 이미지를 저장하는 원격 저장소 |

## 스토리지

| 용어 | 설명 |
|------|------|
| **S3** | Simple Storage Service. 파일(객체) 저장소. 정적 웹 호스팅에도 사용 |
| **EBS** | Elastic Block Store. EC2에 연결하는 가상 디스크 |

## 데이터베이스

| 용어 | 설명 |
|------|------|
| **RDS** | Relational Database Service. 관계형 DB를 관리해주는 서비스 (MySQL, PostgreSQL 등) |
| **DynamoDB** | NoSQL 데이터베이스. 키-값 기반, 서버리스, 자동 스케일링 |

## 네트워크 & 배포

| 용어 | 설명 |
|------|------|
| **ALB** | Application Load Balancer. HTTP/HTTPS 트래픽을 여러 서버/컨테이너에 분배 |
| **CloudFront** | CDN (Content Delivery Network). 전 세계 엣지 서버에 콘텐츠를 캐시하여 빠르게 제공 |
| **Route 53** | DNS 서비스. 도메인 이름을 IP 주소로 변환. 도메인 구매 및 호스팅 영역 관리 |
| **API Gateway** | API 관리 서비스. Lambda와 연결하여 REST API 제공 |

## 보안 & 인증

| 용어 | 설명 |
|------|------|
| **IAM** | Identity and Access Management. 사용자, 권한, 역할을 관리. "누가 무엇을 할 수 있는지" 제어 |
| **IAM Role** | 특정 AWS 서비스에 부여하는 권한. 예: ECS가 ECR에서 이미지를 pull할 권한 |
| **IAM User** | AWS 콘솔/CLI에 접근하는 사용자 계정 |
| **ACM** | AWS Certificate Manager. SSL/TLS 인증서를 무료로 발급/관리. HTTPS에 사용 |

## 인프라 관리

| 용어 | 설명 |
|------|------|
| **CloudFormation** | 인프라를 코드(YAML/JSON)로 정의하고 한 번에 생성/삭제하는 서비스 (IaC) |
| **CloudWatch** | 모니터링 + 로그 관리. 서버/컨테이너의 로그를 수집하고 대시보드로 확인 |

## CI/CD

| 용어 | 설명 |
|------|------|
| **CodePipeline** | AWS의 CI/CD 파이프라인 서비스 |
| **CodeBuild** | 소스 코드 빌드 서비스 |
| **CodeDeploy** | 배포 자동화 서비스 |

> 이 강의에서는 CI/CD로 AWS 서비스 대신 **GitHub Actions**를 사용합니다.
