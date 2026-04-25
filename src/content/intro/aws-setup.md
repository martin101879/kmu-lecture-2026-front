# 인프라 셋업

아래 순서로 진행합니다.

1. **도메인 등록** — Route 53에서 호스팅 영역 생성
2. **EC2 키 페어 생성** — SSH 접속용 키 페어 생성
3. **AWS CLI 설정** — 터미널에서 AWS 서비스를 사용하기 위한 인증 설정
4. **CloudFormation 스택 생성** — 백엔드 인프라 한 번에 생성

## 1. 도메인 등록

이 강의에서는 `cecil1018.click` 도메인을 사용합니다. 각자 서브도메인을 할당받아 실습을 진행합니다.

### 진행 순서

1. 아래 구글 스프레드시트에 접속합니다
2. **이름**, 사용할 **서브도메인**, **NS 레코드** 값을 입력합니다

[구글 스프레드시트 열기](https://docs.google.com/spreadsheets/d/169YrJc_J254qMQhJ7ZR4OEomXU8lvAW60XBDaXAKzDM/edit?gid=0#gid=0)

예시:

| 서브도메인 | NS 레코드 |
|-----------|-----------|
| **{본인영문이름}**.cecil1018.click | (호스팅 영역 생성 후 입력) |

### 호스팅 영역 생성 방법

각자 `{본인영문이름}.cecil1018.click` 형태로 호스팅 영역을 생성합니다. 다른 사람과 중복되지 않는 값이면 아무 값이나 사용해도 됩니다.

1. AWS 콘솔 → **Route 53** 검색 → 클릭
2. **호스팅 영역 생성** 클릭
3. 도메인 이름: `{본인영문이름}.cecil1018.click` 입력 (예: `martin.cecil1018.click`)
4. 유형: **퍼블릭 호스팅 영역** 선택 → **호스팅 영역 생성** 클릭
5. 생성된 호스팅 영역에서 **NS 유형**의 값 4개를 복사하여 스프레드시트에 입력

![Route 53 NS 레코드 확인](/images/route53-ns-record.png)

위 이미지에서 빨간 박스로 표시된 **NS 유형의 값/트래픽 라우팅 대상** 4개가 스프레드시트에 입력할 값입니다.

> 입력이 완료되면 강사가 상위 도메인(`cecil1018.click`)에 여러분의 NS 레코드를 등록합니다.
> 등록이 완료되면 각자의 서브도메인을 사용하여 이후 실습을 진행할 수 있습니다.

생성한 서브도메인은 실습에서 프론트엔드 및 백엔드 접속 시 아래와 같이 사용됩니다.

| 용도 | 도메인 예시 |
|------|-----------|
| 프론트엔드 | `web.{본인영문이름}.cecil1018.click` |
| 백엔드 API | `api.{본인영문이름}.cecil1018.click` |

## 2. EC2 키 페어 생성

EC2에 SSH로 접속하기 위한 키 페어를 생성합니다.

1. AWS 콘솔 상단 검색창에 **EC2** 입력 → 클릭
2. 좌측 메뉴에서 **네트워크 및 보안** → **키 페어** 클릭
3. **키 페어 생성** 클릭
4. 이름: `balance-game` (또는 본인이 원하는 이름)
5. 키 페어 유형: **RSA**
6. 프라이빗 키 파일 형식: **.pem**
7. **키 페어 생성** 클릭 → `.pem` 파일이 자동 다운로드됨

> **중요**: 다운로드된 `.pem` 파일은 이때만 받을 수 있습니다. 분실하면 EC2에 SSH 접속할 수 없으므로 안전한 곳에 보관하세요.

SSH 접속 전에 `.pem` 파일의 권한을 변경해야 합니다. 권한이 너무 열려 있으면 SSH가 접속을 거부합니다.

**macOS / Linux:**

```bash
chmod 400 balance-game.pem
```

**Windows:**

1. `.pem` 파일 우클릭 → **속성** → **보안** 탭
2. **고급** 클릭 → **상속 사용 안 함** 클릭 → **이 개체에서 상속된 사용 권한을 모두 제거합니다** 선택
3. **추가** → **보안 주체 선택** → 본인 사용자 이름 입력 → **읽기** 권한만 체크 → **확인**

## 3. AWS CLI 설정

터미널에서 AWS 서비스를 사용하려면 인증 정보를 설정해야 합니다. 이후 배포 과정에서 `aws ecr`, `aws s3`, `aws cloudfront` 등의 명령어를 사용합니다.

### Access Key 생성

이 강의에서는 편의상 Root 계정에서 Access Key를 생성합니다.

1. AWS 콘솔 우측 상단 → 본인 계정 이름 클릭 → **보안 자격 증명**
2. **액세스 키** 섹션 → **액세스 키 만들기**
3. 용도 선택: **Command Line Interface (CLI)** → 하단 체크박스 체크 → **다음**
4. **액세스 키 만들기** 클릭
5. **Access Key ID**와 **Secret Access Key**를 복사 (이 화면을 닫으면 Secret Key를 다시 볼 수 없음)

> **실무에서는 Root 계정의 Access Key를 사용하지 않습니다.** Root는 결제 정보, 계정 폐쇄 등 모든 권한을 가지고 있어 유출 시 위험합니다. 실무에서는 IAM에서 별도 사용자를 생성하고 **AdministratorAccess** 정책을 부여하여 사용합니다. 이 정책만으로 대부분의 AWS 서비스를 사용할 수 있습니다.

### aws configure 실행

```bash
aws configure
```

아래 값을 입력합니다:

| 항목 | 입력값 |
|------|--------|
| AWS Access Key ID | 위에서 복사한 Access Key ID |
| AWS Secret Access Key | 위에서 복사한 Secret Access Key |
| Default region name | `ap-northeast-2` |
| Default output format | `json` |

설정 확인:

```bash
aws sts get-caller-identity
```

본인의 계정 정보가 표시되면 정상입니다.

## 4. CloudFormation 스택 생성

CloudFormation은 AWS 리소스를 **코드로 정의하고 한 번에 생성**해주는 서비스입니다. 콘솔에서 하나씩 만드는 대신, 템플릿 파일 하나로 전체 인프라를 자동 구성합니다.

아래 템플릿 파일을 다운로드합니다.

→ [cloudformation.yaml 다운로드](/cloudformation.yaml)

1. [AWS CloudFormation 콘솔](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2) 접속
2. **스택 생성** 버튼 클릭
3. "템플릿 지정"에서 **"템플릿 파일 업로드"** 선택 → 다운로드한 `cloudformation.yaml` 파일을 업로드 → **다음**
4. **스택 이름** 입력: `balance-game`
5. **파라미터** 입력:

| 파라미터 | 입력값 | 설명 |
|---------|--------|------|
| DBPassword | `1234qwer` | RDS MySQL 비밀번호 |
| KeyPairName | 위에서 생성한 키 페어 선택 | 드롭다운에서 선택 |
| HostedZoneId | 위에서 생성한 호스팅 영역 선택 | 드롭다운에서 선택 |
| DomainName | `api.{본인영문이름}.cecil1018.click` | 예: `api.martin.cecil1018.click` |

6. **다음** → 스택 실패 옵션: **"새로 생성된 모든 리소스 삭제"** 선택 → **다음** → 맨 아래 **"AWS CloudFormation에서 IAM 리소스를 생성할 수 있음을 승인합니다"** 체크 → **제출**

> CloudFormation 공식 문서: [AWS CloudFormation User Guide](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/Welcome.html)

### 생성 확인

- 상태가 `CREATE_IN_PROGRESS` → `CREATE_COMPLETE`로 변경되면 완료
- 약 **10분** 정도 소요됩니다 (RDS 생성이 가장 오래 걸림)
- 완료 후 **Outputs** 탭에서 아래 값을 확인합니다

| Output | 용도 |
|--------|------|
| ApiUrl | 백엔드 API 접속 URL (HTTPS) |
| EC2PublicIP | EC2 SSH 접속용 IP |
| SSHCommand | SSH 접속 명령어 |
| ECRUri | Docker 이미지 push 대상 주소 |
| RDSEndpoint | RDS 접속 주소 |

## 생성되는 리소스

![CloudFormation 인프라 구성](/images/cloudformation-infra.svg)

### 네트워크

| 리소스 | 용도 |
|--------|------|
| VPC | 가상 네트워크 |
| Subnet (2개) | VPC 내 하위 네트워크 (가용 영역 A, B) |
| Internet Gateway | VPC에서 인터넷으로 나가는 출입구 |
| Route Table | 네트워크 트래픽 경로 규칙 |

### 보안

| 리소스 | 용도 |
|--------|------|
| Security Group (3개) | ALB, EC2, RDS 각각의 접근 제어 |
| IAM Role | EC2가 ECR에서 이미지를 pull할 수 있는 권한 |

### 컴퓨팅

| 리소스 | 용도 |
|--------|------|
| EC2 (t3.micro) | 가상 서버 (Amazon Linux 2023 + Docker 자동 설치) |
| ECR | Docker 이미지 저장소 |

### 로드 밸런서

| 리소스 | 용도 |
|--------|------|
| ALB | 외부 요청을 EC2로 전달하는 로드 밸런서 |
| Target Group | ALB가 요청을 보낼 대상 (EC2:8080) |
| HTTPS Listener | 443번 포트 → Target Group으로 전달 |

### 도메인 + 인증서

| 리소스 | 용도 |
|--------|------|
| Route 53 레코드 | 입력한 도메인 → ALB 연결 |
| ACM 인증서 | SSL/TLS 인증서 (HTTPS용, DNS 검증으로 자동 발급) |

### 데이터베이스

| 리소스 | 용도 |
|--------|------|
| RDS (MySQL 8.0) | 관리형 데이터베이스 (db.t3.micro) |
| DB Subnet Group | RDS가 배치될 서브넷 지정 (2개 AZ) |

> 프론트엔드(S3 + CloudFront)는 AWS 콘솔에서 직접 생성합니다. **프론트엔드 배포** 페이지를 참고하세요.

## 강의 종료 후 정리

강의가 끝나면 **반드시 스택을 삭제**해주세요. 삭제하지 않으면 비용이 계속 발생합니다.

1. CloudFormation → 해당 스택 선택
2. **삭제** 버튼 클릭
3. 모든 리소스가 자동으로 제거됩니다
