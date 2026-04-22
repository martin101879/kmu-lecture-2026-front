# 예외 핸들링

## 현재 문제

밸런스 게임 API에서 존재하지 않는 게임에 투표하면 어떻게 될까요?

```http
POST http://localhost:8080/api/games/999/vote
Content-Type: application/json

{
  "choice": "A"
}
```

현재는 `RuntimeException`이 발생하면서 **500 Internal Server Error**가 반환됩니다. 하지만 "게임을 찾을 수 없다"는 클라이언트의 잘못된 요청이므로 **404 Not Found**가 적절합니다.

| HTTP 상태 코드 | 의미 | 사용 상황 |
|---------------|------|----------|
| 200 | OK | 정상 응답 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 (응답 본문 없음) |
| 400 | Bad Request | 잘못된 요청 (필수 값 누락 등) |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 500 | Internal Server Error | 서버 내부 오류 |

## 커스텀 예외 만들기

상황에 맞는 예외 클래스를 만듭니다. `service/` 패키지에 작성합니다.

```java
package kr.ac.kmu.capstone.balance_api.service;

public class GameNotFoundException extends RuntimeException {

    public GameNotFoundException(Long gameId) {
        super("게임을 찾을 수 없습니다. id=" + gameId);
    }
}
```

Service에서 `RuntimeException` 대신 커스텀 예외를 사용합니다.

```java
// 변경 전
Game game = gameRepository.findById(gameId)
        .orElseThrow(() -> new RuntimeException("게임을 찾을 수 없습니다."));

// 변경 후
Game game = gameRepository.findById(gameId)
        .orElseThrow(() -> new GameNotFoundException(gameId));
```

## 에러 응답 DTO

클라이언트에 일관된 형태의 에러 응답을 반환하기 위한 DTO입니다. `dto/` 패키지에 작성합니다.

```java
package kr.ac.kmu.capstone.balance_api.dto;

import java.time.LocalDateTime;

public record ErrorResponse(
    String message,
    LocalDateTime timestamp
) {
    public static ErrorResponse of(String message) {
        return new ErrorResponse(message, LocalDateTime.now());
    }
}
```

## @ControllerAdvice - 전역 예외 핸들러

`@ControllerAdvice`는 모든 Controller에서 발생하는 예외를 **한 곳에서 처리**하는 Spring의 기능입니다. `controller/` 패키지에 작성합니다.

```java
package kr.ac.kmu.capstone.balance_api.controller;

import kr.ac.kmu.capstone.balance_api.dto.ErrorResponse;
import kr.ac.kmu.capstone.balance_api.service.GameNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 모든 Controller의 예외를 이 클래스에서 처리
public class GlobalExceptionHandler {

    // GameNotFoundException 발생 시 404 응답
    @ExceptionHandler(GameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleGameNotFound(GameNotFoundException e) {
        return ErrorResponse.of(e.getMessage());
    }

    // 그 외 예상하지 못한 예외 발생 시 500 응답
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleRuntimeException(RuntimeException e) {
        return ErrorResponse.of("서버 내부 오류가 발생했습니다.");
    }
}
```

## 동작 확인

VS Code에서 `.http` 파일을 생성하고 테스트합니다.

```http
### 존재하지 않는 게임에 투표 (404 응답 확인)
POST http://localhost:8080/api/games/999/vote
Content-Type: application/json

{
  "choice": "A"
}

### 존재하지 않는 게임 수정 (404 응답 확인)
PUT http://localhost:8080/api/games/999
Content-Type: application/json

{
  "title": "테스트",
  "optionA": "A",
  "optionB": "B"
}

### 존재하지 않는 게임 삭제 (404 응답 확인)
DELETE http://localhost:8080/api/games/999
```

> VS Code에서 각 `###` 위에 나타나는 **Send Request**를 클릭하면 요청이 전송됩니다.

이제 500 대신 **404 응답**과 함께 에러 메시지가 반환됩니다.

```json
{
  "message": "게임을 찾을 수 없습니다. id=999",
  "timestamp": "2026-04-22T14:00:00"
}
```

## 정리

```
예외 핸들링 전:  예외 발생 → 500 Internal Server Error (모든 에러가 동일)
예외 핸들링 후:  예외 발생 → @ControllerAdvice가 예외 종류별로 적절한 응답 코드 반환
```

| 파일 | 역할 |
|------|------|
| `GameNotFoundException` | "게임이 없다"는 상황을 명확히 표현하는 예외 |
| `ErrorResponse` | 클라이언트에 반환하는 에러 응답 형식 |
| `GlobalExceptionHandler` | 예외 종류에 따라 적절한 HTTP 상태 코드와 메시지 반환 |
