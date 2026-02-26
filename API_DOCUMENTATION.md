# Launchpad Backend API Documentation

## Authentication

- **POST /api/auth/register**
  - Body: `{ email, password, name? }`
  - Registers a new user.
  - Returns user id and email.

- **POST /api/auth/login**
  - Body: `{ email, password }`
  - Returns `{ accessToken, refreshToken }`.

- **POST /api/auth/refresh**
  - Body: `{ refreshToken }`
  - Rotates refresh token and returns new tokens.

- **POST /api/auth/logout**
  - Body: `{ refreshToken }`
  - Revokes the refresh token.

## Categories

- **GET /api/categories**
  - Public. Lists all categories.

- **POST /api/categories**
  - Admin only. Body: `{ name }`.

- **PUT /api/categories/:id**
  - Admin only. Body: `{ name }`.

- **DELETE /api/categories/:id**
  - Admin only.

## Ideas

- **GET /api/ideas**
  - Query params: `category`, `sortBy=votes|recent`, `page`, `limit`, `trending=true`.
  - Returns paginated list with vote/comment counts.

- **GET /api/ideas/:id**
  - Get specific idea with associated votes/comments.

- **POST /api/ideas**
  - Authenticated. Body: `{ title, description, categoryId }`.

- **PUT /api/ideas/:id**
  - Owner or admin. Body can include `title`, `description`, `categoryId`.

- **DELETE /api/ideas/:id**
  - Owner or admin.

## Comments

- **GET /api/comments?ideaId=X**
  - List comments optionally filtered by idea.

- **POST /api/comments**
  - Authenticated. Body: `{ ideaId, content }`.

- **PUT /api/comments/:id**
  - Owner or admin. Body: `{ content }`.

- **DELETE /api/comments/:id**
  - Owner or admin.

## Votes

- **POST /api/votes**
  - Authenticated. Body: `{ ideaId }` to upvote. One vote per user per idea.

- **DELETE /api/votes**
  - Authenticated. Body: `{ ideaId }` to remove vote.


---

## Notes

- JWT access and refresh tokens used; access expires quickly (15m) and refresh tokens are stored in DB for revocation/rotation.
- RBAC implemented via middleware; only `ADMIN` role can manage categories.
- Trending logic: filter by ideas created within last 7 days and sort by vote count.
- Input validation performed at controller level; errors return appropriate HTTP status codes.
- Error handler middleware centralizes responses.
