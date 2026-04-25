# CORS

## 문제 확인

API 연동까지 완료하고 브라우저에서 확인하면, 게임 목록이 표시되지 않습니다. 브라우저 개발자 도구(F12) 콘솔을 확인하면 아래와 같은 에러가 보입니다.

```
Access to fetch at 'http://localhost:8080/api/games' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

API 코드는 정상인데, 브라우저가 요청을 **차단**하고 있습니다.

## CORS란?

브라우저는 보안을 위해 **다른 출처** (Origin)로의 요청을 기본적으로 차단합니다. 출처는 프로토콜 + 호스트 + 포트 조합으로 판단합니다.

```
http://localhost:5173  (프론트엔드)
http://localhost:8080  (백엔드)
                ^^^^
                포트가 다름 → 다른 Origin → CORS 차단
```

| 출발 | 도착 | 같은 Origin? | 결과 |
|------|------|------------|------|
| `http://localhost:5173` | `http://localhost:5173` | 같음 | 허용 |
| `http://localhost:5173` | `http://localhost:8080` | 다름 (포트) | **차단** |
| `http://example.com` | `http://api.example.com` | 다름 (호스트) | **차단** |
| `http://example.com` | `https://example.com` | 다름 (프로토콜) | **차단** |

CORS(Cross-Origin Resource Sharing)는 서버가 "이 출처에서의 요청은 허용한다"고 **명시적으로 허가**하는 방식입니다.

### CORS가 혼란스러운 이유

에러는 **프론트엔드** (브라우저)에서 발생하지만, 해결은 **백엔드** (서버)에서 해야 합니다.

```
프론트엔드 개발자: "내 코드는 정상인데 왜 안 되지?"
    → 브라우저가 차단한 것

백엔드 개발자: "내 API는 잘 동작하는데?"
    → curl이나 Postman에서는 CORS가 없어서 정상 동작
    → 브라우저에서만 차단됨
```

CORS는 **브라우저의 보안 정책**이기 때문에 브라우저에서만 발생합니다. 서버 간 통신이나 curl 같은 도구에서는 CORS가 적용되지 않습니다. 그래서 프론트/백엔드 모두 CORS의 동작 방식을 이해하고 있어야 합니다.

> 더 자세한 내용은 MDN 문서를 참고하세요: [CORS - HTTP | MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/Guides/CORS)

## 해결: 백엔드에 CORS 설정 추가

### application.yml

허용할 출처를 설정 파일에 정의합니다.

```yaml
# application.yml
app:
  cors:
    allowed-origins: http://localhost:5173
```

### WebConfig 클래스

설정 클래스에서 이 값을 읽어 CORS를 적용합니다. `config/` 패키지를 생성합니다.

```java
// src/main/java/kr/ac/kmu/capstone/balance_api/config/WebConfig.java

package kr.ac.kmu.capstone.balance_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")  // application.yml에서 값 주입
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```


## 동작 확인

백엔드를 재시작한 후 프론트엔드에서 다시 확인합니다.

1. 백엔드 재시작 (`./gradlew bootRun`)
2. `http://localhost:5173`에 접속
3. 게임 목록이 정상적으로 표시되는지 확인
4. 게임 생성, 투표가 동작하는지 확인

## 정리

![CORS 요청 흐름](/images/cors-flow.svg)

| 파일 | 역할 |
|------|------|
| `application.yml` | 허용할 출처 정의 |
| `WebConfig.java` | Spring MVC에 CORS 설정 등록 |

> **배포 시 주의**: 현재 `allowed-origins`가 `http://localhost:5173`으로 설정되어 있습니다. AWS에 배포할 때는 CloudFront 도메인(예: `https://web.martin.cecil1018.click`)으로 변경해야 합니다. 여러 출처를 허용하려면 쉼표로 구분하여 설정할 수 있습니다.
