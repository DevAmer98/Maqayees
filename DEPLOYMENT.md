# Deploying to Vercel

This project is a Next.js 15 app router project that uses Prisma, NextAuth.js, and an FTP connection to a Synology NAS. The steps below describe everything needed to run it on [Vercel](https://vercel.com/).

## 1. Prerequisites

- Vercel account with access to create Projects and manage Environment Variables.
- Remote PostgreSQL instance that Vercel can reach (Neon, Supabase, Aiven, Railway, etc.). Local Postgres instances will not work because Vercel functions run in the cloud.
- Optional but recommended: [Vercel CLI](https://vercel.com/docs/cli) installed locally.

## 2. Database setup

1. Create a production Postgres database and grab its connection string.
2. Update your local `.env` file to point to this database via `DATABASE_URL`.
3. Run the Prisma migrations against the remote DB:

   ```bash
   npx prisma migrate deploy
   ```

4. Seed initial data if you need it:

   ```bash
   npm run seed
   ```

5. Once the schema and seed look correct, keep this same `DATABASE_URL` for Vercel.

## 3. Environment variables

Define the following variables in Vercel (Project → Settings → Environment Variables or via `vercel env add`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma connection string for the managed Postgres instance. Must include `sslmode=require` when using Neon/Supabase. |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT. Generate a new one via `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` for production deployments. For Preview, Vercel automatically sets `VERCEL_URL`, so you can optionally omit this variable and let NextAuth fall back to it. |
| `SYNOLOGY_HOST`, `SYNOLOGY_PORT`, `SYNOLOGY_USER`, `SYNOLOGY_PASSWORD` | Credentials for the Synology NAS that stores uploads. Ensure the NAS firewall allows outbound Vercel IPs or, ideally, expose it through a public hostname + HTTPS-compatible port. |
| `SYNOLOGY_TRUCK_PATH`, `SYNOLOGY_SHIFT_PATH` | Remote directory roots where files should be placed. The code automatically trims trailing slashes. |

Tips:

- Use “Production” environment in Vercel for the real credentials. Copy the same keys into the “Preview” and “Development” scopes only if needed.
- If you prefer the CLI workflow, run `vercel env add VARIABLE production` for each key.
- Never commit `.env` to git; keep it local.

## 4. Run a local production build check

Before deploying, confirm the project can build using the production database and env vars:

```bash
npm install
npm run lint
npm run build
```

Fix any issues locally before pushing to the remote repository.

## 5. Connect the repo to Vercel

1. Push the project to GitHub/GitLab/Bitbucket.
2. In Vercel, click “Add New Project” → import the repo.
3. Vercel auto-detects the framework as Next.js. Keep the defaults:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Enable “Serverless/Edge Functions Region” closest to your database (e.g., Frankfurt for Neon EU Central). This reduces latency for Prisma queries.
5. Click “Deploy”. The first build will run `npm install`, `npm run build`, and output serverless bundles.

## 6. Verify Prisma + NextAuth in production

- After the first deployment finishes, open the production URL and log in via the existing seeded user.
- Run `vercel logs <project-name> --prod` (or check the dashboard) if authentication fails—the common culprits are a missing `NEXTAUTH_SECRET` or an incorrect `NEXTAUTH_URL`.
- Prisma automatically uses the `DATABASE_URL` you configured; no additional `prisma generate` step is required because Vercel runs it during `npm install`.

## 7. Handling Synology uploads

The `app/api/trucks/*` and `app/api/shifts` routes use the `basic-ftp` client with `runtime = "nodejs"` to upload to the Synology NAS. For production:

1. Ensure the NAS hostname (`SYNOLOGY_HOST`) resolves from the public internet and the FTP port is reachable from Vercel.
2. Use FTPS (explicit TLS) if possible; otherwise the credentials travel in plain text. You can enable this by changing the API routes to set `secure: true` once the NAS supports it.
3. Double-check that `SYNOLOGY_*` variables exist in Vercel’s “Preview” environment if you want to test uploads on preview deployments; otherwise the routes gracefully fall back to local storage (`public/uploads/...`).

## 8. Optional: Deploy with the Vercel CLI

If you prefer deploying from the terminal:

```bash
vercel link  # one-time linking of the repo to the Vercel project
vercel env pull .env.local
vercel --prod
```

This workflow mirrors what the Git provider integration does but lets you trigger deployments manually.

## 9. Post-deploy checklist

- ✅ Authentication works (`/login` → `/dashboard`).
- ✅ Database reads/writes succeed (create/update vehicles, shifts, etc.).
- ✅ File uploads land in the Synology destination or the fallback local `/uploads` path.
- ✅ `middleware.js` protects dashboard routes (test unauthorized access).
- ✅ Preview deployments inherit the correct env vars (especially when QA validate before release).

Once all checks pass, the app is production-ready on Vercel.
