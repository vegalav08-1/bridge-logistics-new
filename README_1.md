# Cursor Project Guidelines

## 📌 Global Rules

1. **No unnecessary deletions**
   - Always mark code as `deprecated` first.
   - Migrate to the new component.
   - Only then remove the old code.

2. **All changes must be small PRs with feature flags:**
   - `AUTH_V2_ENABLED`
   - `ENFORCE_PARENT_ADMIN`
   - `AUTO_ADD_CHAT_MEMBERS`
   - `CHAT_SUMMARY_ON_CREATE`
   - `WS_ENABLED`
   - `NEW_FEED_UI`

3. **Maintain API compatibility**
   - Add new fields/endpoints without breaking existing ones.
   - Legacy endpoints remain supported until the final **Cleanup** sprint.

4. **Database changes**
   - Use **Prisma migrations** only.
   - Never use `reset`, `DROP`, or `TRUNCATE`.

5. **Sprint completion checklist**
   - ✅ Linting
   - ✅ Type checks
   - ✅ Unit & integration tests
   - ✅ E2E smoke tests

6. **Mobile-first design**
   - Reference width: **360–430px**
   - Touch targets: **≥44px**
   - Unified color palette: **brand emerald-600**

7. **Unified UI patterns**
   - Feed cards, chat, forms — must come from the same shared component library.

---

## ⚙️ Recommended Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS + React Query
- **Backend API:** Next.js API routes **or** Express/Nest (choose one and keep consistent), TypeScript, Zod for validation
- **Database:** PostgreSQL + Prisma
- **Realtime:** WebSocket (`ws`) or Socket.IO (choose one module)
- **Files:** S3-compatible storage (MinIO/S3) with presigned uploads
- **Mail:** SMTP / SendGrid
- **Tests:** Vitest/Jest + Playwright

---

## 📂 Monorepo Structure

```
/apps/web            # Next.js (UI + API if using API routes)
/packages/api        # Server handlers & schemas (if separate)
/packages/db         # Prisma schema, migrations, client
/packages/ui         # Shared UI components (Feed, Card, Chat)
/packages/utils      # Utilities, validations, status constants
```

---

## 🔑 Environment Variables

```
DATABASE_URL=...
JWT_SECRET=...
REFRESH_SECRET=...
SMTP_URL=...
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=...
```

---

✦ Follow these rules to ensure **consistency, stability, and smooth collaboration** across the Cursor project.
