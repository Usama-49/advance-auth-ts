# 🔒 Express JWT Auth Engine

> A production-grade authentication engine built with Node.js, Express, and TypeScript. Features a stateless dual-token strategy (short-lived JWT access tokens + HTTP-only refresh cookies), database-backed session revocation via `tokenVersion`, Zod schema validation, and email verification.

---

## 🚀 Features Implemented

- **Type-Safe Validation:** Zod schemas for strict request body and environment variable parsing.
- **Dual-Token System:** Short-lived Access Tokens (30m) paired with long-lived Refresh Tokens (7d) stored securely in `httpOnly` cookies.
- **Global Session Revocation:** Integrated `tokenVersion` check in Mongoose models to kill compromised user sessions instantly.
- **Secure Email Verification:** Async verification pipeline powered by Nodemailer, Mailtrap, and signed verification tokens.
- **Password Hashing:** Secure password storage using `bcryptjs` with optimized salt rounds.
- **Google OAuth 2.0 Integration:** Full authorization code flow using `google-auth-library`. Features automatic user provisioning, automatic account verification, and secure dual-token payload generation.

---

## 🛠️ Tech Stack

| Category                  | Technology                                                                 |
| :------------------------ | :------------------------------------------------------------------------- |
| **Runtime & Language**    | Node.js, TypeScript                                                        |
| **Framework**             | Express.js                                                                 |
| **Database & ODM**        | MongoDB, Mongoose                                                          |
| **Authentication**        | JSON Web Tokens (`jsonwebtoken`)                                           |
| **Validation & Security** | Zod, Bcrypt.js                                                             |
| **Email Services**        | Nodemailer + Mailtrap (Testing)                                            |
| **Authentication**        | JSON Web Tokens (`jsonwebtoken`), Google OAuth 2.0 (`google-auth-library`) |

> **Note:** Mailtrap is currently used for local email testing and inbox simulation. It will be swapped for Resend in production.

---

## ⚡ Getting Started

### 1. Prerequisites

- Node.js (v18+)
- MongoDB connection string (Local or Atlas)

### 2. Environment Variables

Copy .env.example to .env and configure your credentials:

cp .env.example .env

### 3. Installation & Run

# Install dependencies

npm install

# Run in development mode

npm run dev

## 🔄 Auth Lifecycle Flow

[ Register ] ──> Sends Verification Link ──> [ Verify Email ]
│
▼
[ Google OAuth Start ] ──> Redirects ──> [ OAuth Callback ] ──> Creates/Links User & Issues Tokens
│
▼
[ Protected API ] <── Uses Access Token ──── [ Login ] ──> Sets HTTP-Only Refresh Cookie
│
(Expired)
│
└───> [ POST /auth/refresh ] ──> Issues New Access Token

## 🚧 What's Coming Next?

This repository is actively evolving into a fully featured enterprise auth blueprint. Upcoming implementations include:

- [ ] Password Reset Pipeline (Forgot / Reset Password endpoints)
- [ ] Rate Limiting (Protection against brute-force attacks)
- [ ] Two-Factor Authentication (2FA) (TOTP-based authentication)
- [x] OAuth 2.0 Integration (Google Social Login implemented; GitHub coming next)

---

## 👤 Author

Built with 💻 by **Usama**
