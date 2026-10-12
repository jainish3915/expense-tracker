# Prachay Expense Voucher Management

Production-oriented Phase 1 monorepo for the Prachay Securities internship assignment.

## Stack

- `frontend`: React, Vite, TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, TanStack Query, Recharts, Lucide.
- `backend`: Express, TypeScript, Prisma, PostgreSQL, JWT sessions in secure HTTP-only cookies, bcrypt, Helmet, rate limiting, Zod.

## Run locally from the terminal

### First-time setup

The project uses the local PostgreSQL cluster in `.local-postgres`. Start it in a separate terminal and keep that terminal open:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\postgres.exe" -D ".local-postgres" -p 55432
```

If `backend/.env` does not exist, copy `.env.example` to `backend/.env` first and update the secrets.

Then, from the project root, install dependencies, create the database schema, and seed the demo accounts:

```powershell
npm install
npm run db:migrate
npm run db:seed
```

### Start the program

Use three terminals from the project root. Keep the database terminal running, then run:

Terminal 1 - database:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\postgres.exe" -D ".local-postgres" -p 55432
```

Terminal 2 - API:

```powershell
npm run dev --workspace backend
```

Terminal 3 - frontend:

```powershell
cd frontend
npx vite --host 127.0.0.1 --port 5173
```

Alternatively, on systems where the combined command works, start both Node apps with:

```powershell
npm run dev
```

Frontend: http://localhost:5173 · API: http://localhost:4000/health

Open the sign-in screen at http://localhost:5173/login. The API port on `4000` is not a browser UI. Login requires a reachable PostgreSQL database with the migration and seed completed.

The local development setup uses PostgreSQL on port `55432` to avoid changing any existing PostgreSQL installation. The project-local cluster is stored under `.local-postgres/` and is ignored by Git.

## Demo credentials

These are local-only seeded credentials; change them before any shared deployment.

- Employee: `employee.demo@prachay.local` / `Employee@123`
- Employee 2: `employee2.demo@prachay.local` / `Employee2@123`
- Director: `director.demo@prachay.local` / `Director@123`
- Accounts: `accounts.demo@prachay.local` / `Accounts@123`

## Security notes

The server derives the user, role, and employee identity from a signed JWT session cookie. Mutating authenticated requests require the CSRF token returned by `/api/v1/auth/csrf` in the `x-csrf-token` header. Voucher numbers use a database sequence row and transaction, never a count of existing vouchers.

## Voucher API

Employee routes: `POST /api/v1/vouchers`, `GET /api/v1/vouchers/mine`, `GET/PATCH/DELETE /api/v1/vouchers/:id`, `POST /api/v1/vouchers/:id/signature`, and `POST /api/v1/vouchers/:id/submit`.

Director routes: `GET /api/v1/director/vouchers`, `GET /api/v1/director/vouchers/pending`, `POST /api/v1/director/vouchers/:id/signature`, `POST /approve`, and `POST /reject`.

Accounts routes: `GET /api/v1/accounts/vouchers` and `GET /api/v1/accounts/dashboard`. Signature bytes are served only through the authenticated `/api/v1/signatures/:voucherId/:kind` endpoint.

## Verification

Run `npm run typecheck`, `npm run build`, and `npm test --workspace backend`. With PostgreSQL running, the migration and seed commands verify database connectivity and demo data.
