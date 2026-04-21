# React 컴포넌트 작성

## 함수형 컴포넌트

```tsx
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
```

## API 연동 (fetch)

```tsx
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
```

## 핵심 포인트

- **Props**: 부모 → 자식으로 데이터 전달
- **useState**: 컴포넌트 내부 상태 관리
- **useEffect**: 사이드 이펙트 처리 (API 호출 등)
- **key**: 리스트 렌더링 시 고유 식별자 필수
