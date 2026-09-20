# CostLog — personal expense tracker

A private notebook for personal expenses. Create **cost fields** (Study Abroad,
Education, Freelancing, Travel …), record every cost inside them, and the total
updates itself.

Built with **Next.js (App Router, JavaScript only)**, Tailwind CSS,
**Auth.js (NextAuth v5)** — email + password and Google — and **MongoDB**.

## Getting started

```bash
cp .env.example .env.local   # at minimum: NEXTAUTH_SECRET
npm install
npm run dev
```

### Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. When empty, CostLog starts a self-hosted `mongod` for you so the app runs without a database server. |
| `MONGODB_DB_NAME` | Database name (default `costlog`). |
| `NEXTAUTH_SECRET` | Signs the session JWT — `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Public base URL, e.g. `https://costlog.app`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client (Google Cloud Console → Credentials). Add `https://your-domain/api/auth/callback/google` as a redirect URI. |

## Security model

The client is never the security boundary.

- Every `/api/*` route goes through `withUser()` (`src/lib/api-route.js`), which
  reads the session and passes the **user id from the JWT** into the handler. The
  browser never sends a uid.
- Every query in `src/lib/data.js` puts `userId` in the filter — including the
  nested ones (`updateExpense`, `deleteExpense` match on `{ _id, userId, categoryId }`).
  Another user's document id cannot be read, edited or deleted, even with a
  hand-crafted request.
- Passwords are hashed with **bcrypt** (10 rounds); the hash is stripped from
  every serialized document and never leaves the server.
- Sessions are JWTs (no readable session collection), and `src/middleware.js`
  redirects any unauthenticated request for `/` or `/categories/*` to `/login`.
- Server-side validation mirrors the form validation for name, sector, amount
  and date.

## Data model

```text
users        { _id, name, email, image, provider, passwordHash, createdAt }
categories   { _id, userId, name, createdAt }
expenses     { _id, userId, categoryId, sector, amount, date, createdAt }
```

Indexes: unique `users.email`, plus `userId`-leading indexes on `categories`
and `expenses`. Totals are computed with a single `$group` aggregation per load,
so they can never drift from the stored expenses.

## Structure

```text
src/
├── middleware.js                  redirects unauthenticated requests to /login
├── app/
│   ├── page.js                    protected dashboard
│   ├── login/page.js              Welcome back
│   ├── register/page.js           Create your account
│   ├── categories/[id]/page.js    category details + expenses
│   └── api/
│       ├── auth/[...nextauth]     Auth.js (credentials + Google)
│       ├── auth/register          account creation
│       ├── categories …           user-scoped CRUD
│       └── health                 database ping
├── components/                    Header, CategoryCard, ExpenseCard, modals …
├── context/AuthContext.js         user, loading, login, register, loginWithGoogle, logout
├── hooks/                         useCategories, useExpenses, summarize
└── lib/
    ├── mongo.js                   cached MongoDB connection (+ self-hosted fallback)
    ├── data.js                    all queries, always scoped by userId
    ├── auth.js                    Auth.js providers, bcrypt, session helpers
    ├── auth-config.js             edge-safe config shared with middleware
    ├── api-route.js               session check + error translation for routes
    ├── api.js                     browser fetch client
    ├── formatCurrency.js          formatCurrency(), formatDate(), todayISO()
    └── errors.js                  error codes → human sentences
```

## Currency

`formatCurrency()` is the only place money is formatted. It defaults to
Bangladeshi Taka (`৳`, lakh grouping: `৳1,25,000`); add an entry to
`CURRENCIES` in `src/lib/formatCurrency.js` to support another currency.
