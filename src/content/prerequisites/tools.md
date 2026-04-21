# 개발 도구 설치

## Git

소스 코드 버전 관리 도구입니다.

### Windows

1. [https://git-scm.com/download/win](https://git-scm.com/download/win) 에서 다운로드
2. 설치 파일 실행 (기본 옵션 그대로 진행)

설치 확인:
```powershell
git --version
```

### macOS

macOS에는 Xcode Command Line Tools에 Git이 포함되어 있습니다:
```bash
git --version
```

설치되어 있지 않다면:
```bash
xcode-select --install
```

또는 Homebrew로 최신 버전을 설치할 수 있습니다:
```bash
brew install git
```

---

## Docker Desktop

컨테이너 기반 개발 및 배포에 사용합니다.

### Windows

1. [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) 에서 **Docker Desktop for Windows** 다운로드
2. 설치 파일 실행
3. 설치 완료 후 **재부팅**이 필요할 수 있습니다
4. WSL 2 백엔드를 사용하므로, 설치 중 WSL 2 설치 안내가 나오면 따라 진행하세요

설치 확인:
```powershell
docker --version
```

### macOS

1. [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) 에서 **Docker Desktop for Mac** 다운로드
2. `.dmg` 파일 실행 후 Applications 폴더로 드래그
3. Docker Desktop 실행

> Apple Silicon(M1/M2/M3/M4) Mac은 **Apple Silicon** 버전을, Intel Mac은 **Intel** 버전을 다운로드하세요.

설치 확인:
```bash
docker --version
```

---

## PowerShell (Windows만 해당)

Windows에서 PowerShell이 설치되어 있지 않은 경우에만 설치가 필요합니다.

확인 방법 - 시작 메뉴에서 "PowerShell"을 검색하여 실행되면 이미 설치되어 있는 것입니다.

설치되어 있지 않은 경우:
1. [https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases) 에서 최신 `.msi` 파일 다운로드
2. 설치 파일 실행
