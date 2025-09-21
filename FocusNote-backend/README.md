# FocusNote Backend (Express + Prisma)

This project scaffold implements the database schema you asked for (users, otp, chat with JSON messages, input blobs, output blobs) and a minimal Express server with routes to:
- request / verify OTP (email-based auth)
- upload / download input files (stored as blobs in DB)
- upload / download output files (stored as blobs in DB)
- create chats and append messages (messages stored as JSON in chats.messages)

## Quick start (local)
1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` -> `.env` and edit `DATABASE_URL` and `JWT_SECRET`.
3. Generate Prisma client:
   ```
   npx prisma generate
   ```
4. Run initial migration (requires a running PostgreSQL database pointed to by DATABASE_URL):
   ```
   npx prisma migrate dev --name init
   ```
5. Start the dev server:
   ```
   npm run dev
   ```

## Useful endpoints
- POST /auth/request-otp  `{ "email": "alice@example.com" }`
- POST /auth/verify-otp   `{ "email": "alice@example.com", "code": "123456" }`
- POST /inputs (multipart/form-data) `file=@/path/to/file.jpg` (Authorization: Bearer <token>)
- GET /inputs/:id (Authorization: Bearer <token>)
- POST /outputs (multipart/form-data) `file=@...` (Authorization: Bearer <token>)
- GET /outputs/:id (Authorization: Bearer <token>)
- POST /chats `{ "title": "Session 1", "messages": [] }` (Auth)
- PATCH /chats/:id/messages `{ "message": { "sender": "user", "text": "..." } }` (Auth)

## Messages JSON example (same as included in README below)
See `docs/messages-example.json` for an example structure.

## Notes
- Files are stored in the database as binary blobs (Prisma `Bytes`). This is fine for prototyping/hackathon use, but for production large files it's often better to use object storage (S3/etc.).
- The OTP endpoint currently returns the code in the response for development convenience. Integrate an email provider (SendGrid, SES, etc.) to email codes in production and remove the code from responses.
