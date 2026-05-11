# NexusCRM — Multi-Tenant CRM

Next.js 14 (App Router) + Prisma + PostgreSQL + NextAuth.

## Stack
- Framework: Next.js 14 App Router (full-stack)
- Database: PostgreSQL + Prisma ORM
- Auth: NextAuth.js (credentials + JWT)
- UI: Tailwind CSS

## Multi-Tenancy Model
Each **Organization** is a tenant. Users can belong to multiple orgs with different roles (OWNER, ADMIN, MEMBER). All data (contacts, deals, activities) is scoped to an org via `orgId`. The `getOrgMembership()` helper verifies the current user is a member before every API call.

## Setup

```bash
psql -U postgres -c "CREATE DATABASE multi_tenant_crm;"
npm install
cp .env.example .env   # fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push
npm run dev            # http://localhost:3000
```

## Features
- **Multi-org** — create multiple organizations, switch between them
- **Contacts** — full CRUD, search, filter by status (Lead/Prospect/Customer/Churned)
- **Deals Pipeline** — Kanban board with 6 stages, move deals between stages
- **Activity Log** — log notes, calls, emails, meetings; auto-logged on deal/contact events
- **Team Members** — invite members by email, role-based access (Owner/Admin/Member)
- **Dashboard** — pipeline stats, deal stage breakdown, recent activity feed
- **JWT Auth** — register, login, session management
# Invoice-Platform
