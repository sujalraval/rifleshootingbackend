# Rifle Shooting ERP & Management System — Project Handoff & Setup Guide

This document contains full details of the project architecture, environment setup, database migrations, CI/CD pipeline, and recent implementations so you can immediately continue development from any system.

---

## 1. Project Overview & Repositories

- **Frontend Repository:** `rifleshooting2` (Vite + React + TypeScript + Tailwind CSS)
  - Local path: `d:\others\OFFICE\rifleshooting2`
  - GitHub: https://github.com/sujalraval/rifleshooting2
- **Backend Repository:** `rifleshootingbackend` (Node.js + Express + TypeScript + Prisma ORM + PostgreSQL)
  - Local path: `D:\others\OFFICE\rifleshootingbackend`
  - GitHub: https://github.com/sujalraval/rifleshootingbackend
- **Production Server:** Ubuntu VPS (`82.112.226.201`)
  - App Directory: `~/htdocs/rifleshooting_bck_prod`
  - Managed by: PM2 + PostgreSQL (port 5433) + Nginx

---

## 2. Architecture & Key Features Implemented

### A. Dynamic Role-Based Access Control (RBAC)
- **Role Master (`RoleMaster.tsx`):** Create, edit, and delete system roles.
- **Roles & Rights Master (`RolesAndRightsMaster.tsx`):** Configure granular module permissions (`canRead`, `canWrite`, `canDelete`) for each role.
- **Backend Fix:** Uses `rawPrisma.rolePermission.deleteMany` to safely hard-delete old permissions before updating, avoiding `(roleId, module)` compound unique constraint errors.
- **System User Form (`UserForm.tsx`):** Fetches live database roles dynamically in the role dropdown and displays the logged-in user in the Sidebar footer.

### B. File Upload System (`/uploads`)
- Migrated from Base64 string storage to disk storage.
- Backend uploads directory: `D:\others\OFFICE\rifleshootingbackend\uploads`
- Static route: Served at `http://localhost:5000/uploads/<filename>` (and `/uploads/...` in production).
- Upload endpoint: `POST /api/upload` (accepts `file` field or `files` array).
- Frontend service: `src/api/services/uploadApi.ts` provides:
  - `uploadFile(file: File): Promise<string>` -> returns relative path `/uploads/xyz.png`
  - `getFileUrl(path?: string): string` -> handles relative paths, base64 strings, and absolute URLs.
- Applied across: **Members**, **S1 Category Form**, **Member Profile**, and **System Users**.

### C. ADRA Certificate Generation (`CertificateGenerator.tsx`)
- Accessible via `/certificate/:type/:id` for both normal members (`type=member`) and S1 members (`type=s1`).
- Multi-line header formatted as **Ahmedabad District Rifle Association**.
- Enlarged logo (90x90px) and member passport photograph loaded via `getFileUrl`.
- Displays combined disciplines (`Rifle / Pistol / Shotgun`) if multiple options were selected.
- Non-printed top toolbar with editable **Trainer Name**, **President Name**, and **Issue Date**.
- Clean A4 print stylesheet.

### D. S1 Member Integration & Profile
- S1 members have their own table `S1Member` in Prisma.
- `members.service.ts` in the backend unifies `findById`, `update`, and `getIssuedItems` to automatically fallback to `S1Member` when regular `Member` is not found, allowing seamless profile viewing.
- Restored **View Profile** button in `S1Form.tsx`.

---

## 3. Database & Migrations (Prisma)

### PostgreSQL Schema Highlights:
- `User` & `Role` & `RolePermission`
- `Member` & `S1Member`
- `FinancialYear`
- `MembershipName` & `MembershipCharge`
- `MemberSubscription` & `OutstandingCharge`
- Soft-delete extension on Prisma Client with `isDeleted` and `deletedAt`.

### Production Safe Migration Rule:
- On production servers: Always run `npx prisma migrate deploy` (never `migrate dev`).
- Soft-delete queries wrap model operations, while `rawPrisma` is exported from `src/core/prisma.ts` for operations requiring direct DB manipulation.

---

## 4. Automated CI/CD Deployment Pipeline

A GitHub Actions workflow is active in `.github/workflows/deploy.yml` on the backend repository.

### How it works:
Every `git push origin main` triggers an automated deployment to your VPS:
1. Connects to `82.112.226.201` via SSH.
2. Pulls latest changes (`git pull origin main`).
3. Runs `npm install`.
4. Runs `npx prisma migrate deploy` and `npx prisma generate`.
5. Compiles TypeScript (`npm run build`).
6. Ensures `uploads/` directory exists with write permissions.
7. Restarts PM2 process (`pm2 restart all`).

### GitHub Repository Secrets Configured:
- `SSH_HOST`: `82.112.226.201`
- `SSH_USERNAME`: `datarsoft-spsc`
- `SSH_PORT`: `22`
- `SSH_PRIVATE_KEY`: OpenSSH Private Key authorized on the VPS.

---

## 5. How to Set Up on a New Machine

### Prerequisites:
- Node.js 18+ or 20+
- PostgreSQL
- Git

### Backend Setup:
```bash
git clone https://github.com/sujalraval/rifleshootingbackend.git
cd rifleshootingbackend
npm install

# Create .env file with your database URL & JWT secret:
# DATABASE_URL="postgresql://username:password@localhost:5432/rifleshooting_db?schema=public"
# JWT_SECRET="your_jwt_secret"
# PORT=5000

npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup:
```bash
git clone https://github.com/sujalraval/rifleshooting2.git
cd rifleshooting2
npm install

# Check .env or src/api/axios.ts to point baseURL to http://localhost:5000/api
npm run dev
```

---

## 6. Project Structure Quick Reference

```
rifleshootingbackend/
├── prisma/
│   ├── schema.prisma               # Prisma Schema
│   └── migrations/                 # All 12 PostgreSQL migrations
├── src/
│   ├── core/
│   │   ├── prisma.ts               # Extended Prisma with soft-delete & rawPrisma export
│   │   └── middlewares/            # auth, upload (multer diskStorage)
│   ├── modules/
│   │   ├── auth/                   # Authentication & login
│   │   ├── roles/                  # Role & permissions controller/service
│   │   ├── users/                  # System users
│   │   ├── members/                # Regular & S1 members unification
│   │   ├── upload/                 # File upload endpoints
│   │   ├── financialYear/          # Financial year periods
│   │   └── membershipCharges/      # Membership charges & names
│   └── server.ts                   # Express server & static /uploads mounting
└── .github/workflows/deploy.yml    # CI/CD deployment pipeline

rifleshooting2/ (Frontend)
├── src/
│   ├── api/
│   │   ├── axios.ts                # Axios client with interceptors
│   │   └── services/               # rolesApi, uploadApi, authApi, usersApi, membersApi
│   ├── components/
│   │   ├── ADRALogo.tsx            # ADRA gold crest logo
│   │   ├── Sidebar.tsx             # Sidebar with dynamic user profile & role
│   │   └── ui.tsx                  # Reusable UI design system
│   └── pages/
│       ├── Login.tsx               # Auth screen
│       ├── RolesAndRightsMaster.tsx# RBAC permissions matrix
│       ├── RoleMaster.tsx          # System roles
│       ├── UserForm.tsx            # Add/Edit User with photo upload & live roles
│       ├── Members.tsx             # Member directory
│       ├── S1Form.tsx              # S1 Category members
│       ├── MemberProfile.tsx       # Member 360 profile
│       └── CertificateGenerator.tsx# ADRA Certificate generator & print engine
```

