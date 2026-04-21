# REST API 만들기

## Controller 작성

```java
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
```

## Entity 작성

```java
@Entity
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    // getters, setters
}
```

## 핵심 포인트

- `@RestController`: JSON 응답을 반환하는 컨트롤러
- `@RequestMapping`: URL 경로 매핑
- `@GetMapping` / `@PostMapping`: HTTP 메서드 매핑
- 실제 필드에서는 **DTO 패턴**을 사용해 Entity를 직접 노출하지 않습니다
