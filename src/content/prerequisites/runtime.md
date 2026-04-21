# 런타임 설치

## Java 21 이상

Spring Boot 실행에 필요합니다.

### Windows

1. [https://adoptium.net](https://adoptium.net) 에서 **Temurin JDK 21** 다운로드
2. `.msi` 설치 파일 실행
3. 설치 중 **"Set JAVA_HOME variable"** 옵션을 반드시 체크

설치 확인:
```powershell
java -version
```

### macOS

Homebrew를 사용합니다:
```bash
brew install openjdk@21
```

또는 [https://adoptium.net](https://adoptium.net) 에서 `.pkg` 파일을 다운로드하여 설치합니다.

설치 확인:
```bash
java -version
```

---

## Node.js 22 이상

React 개발에 필요합니다.

> **권장**: Node.js는 직접 설치보다 **nvm(Node Version Manager)** 을 통해 설치하는 것을 권장합니다.
> nvm을 사용하면 여러 버전의 Node.js를 자유롭게 전환할 수 있어 프로젝트별 버전 관리가 편리합니다.

### Windows (nvm-windows)

1. [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases) 에서 `nvm-setup.exe` 다운로드 및 설치
2. 설치 후 터미널에서:
```powershell
nvm install 22
nvm use 22
```

직접 설치를 원하는 경우 [https://nodejs.org](https://nodejs.org) 에서 LTS 버전 `.msi` 파일을 다운로드하여 설치합니다.

설치 확인:
```powershell
node -v
npm -v
```

### macOS (nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

터미널을 재시작한 후:
```bash
nvm install 22
nvm use 22
```

직접 설치를 원하는 경우 `brew install node` 또는 [https://nodejs.org](https://nodejs.org) 에서 설치합니다.

설치 확인:
```bash
node -v
npm -v
```
