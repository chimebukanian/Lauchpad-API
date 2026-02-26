# Launchpad API (Express + Prisma)

This repository contains the backend implementation for the Launchpad idea validation platform. It was built using Express, Prisma (SQLite for development), and JWT-based authentication with refresh/access tokens.

## Features

- User registration/login with hashed passwords
- JWT access & refresh tokens with rotation and revocation
- Role-based access control (RBAC) for admin operations
- Idea CRUD with categories, comments, and vote tracking
- One vote per user per idea, with endpoints to vote/unvote
- Filtering, sorting and trending logic for idea lists
- Category management protected by admin role
- Input validation and centralized error handling

## Data Model

The Prisma schema (`prisma/schema.prisma`) defines the following models:

- **User**: holds credentials, role, relations to ideas, comments, votes, and refresh tokens
- **Idea**: title, description, relationships to a category and user, plus votes/comments
- **Category**: unique name used to classify ideas
- **Comment**: content tied to an idea and a user
- **Vote**: unique constraint on `(userId, ideaId)` to enforce one vote per user
- **RefreshToken**: stores active refresh tokens for rotation and revocation

A simple enum `Role` distinguishes `USER` from `ADMIN`.

## Getting Started

1. **Install dependencies**
   ```sh
   pnpm install
   ```

2. **Configure environment**
   Create a `.env` file (see `.env.example`) and set `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `DATABASE_URL`.

3. **Run migrations**
   ```sh
   pnpm prisma:migrate
   pnpm prisma:generate
   ```
   (SQLite database will be created at `./dev.db`.)

4. **Start the server**
   ```sh
   pnpm dev
   ```

The API will be available at `http://localhost:4000/api`.

## Deployment

For production, switch the Prisma datasource to a managed PostgreSQL and set environment variables accordingly. Ensure secrets are strong and rotate tokens periodically.

## Architectural Notes

- **Separation of concerns**: routers delegate to controllers; middleware handles authentication/authorization.
- **Extensibility**: additional features (e.g. notifications, attachments) can be added by expanding the Prisma schema and corresponding controllers.
- **Scalability**: relational design and indexing (implicit via PKs) support large numbers of ideas/comments; voting counts are derived at query time but could be cached or aggregated with triggers for high load.
- **Security**: password hashing with bcrypt; JWTs signed with secrets stored in env; refresh tokens persisted for revocation. RBAC ensures only privileged users can modify categories.

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details.

---

This challenge implementation demonstrates product thinking, data modeling, and backend design choices required by the Launchpad specification.
