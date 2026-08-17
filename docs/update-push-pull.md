# Update Halo after local changes (push, pull, go live)

Use this every time Cursor (or you) changes files in this project and you want GitHub **and** https://css.iqpigeon.com to match.

There are **two copies** of the app:

| Place | Path | What it is |
| --- | --- | --- |
| This PC | `C:\Users\dell\Desktop\Child Safety Programme` | Where you edit |
| GitHub | `https://github.com/haydenak63/child-school-safety` | Backup and source of truth (`main`) |
| Live server | `~/halo` on cPanel | What parents and schools actually open |

`git push` only updates GitHub. The live site does **not** change until you pull on the server **and** install a Windows production build. cPanel cannot run `next build` (CloudLinux 8 / glibc 2.28).

---

## 0. Always open the project folder first

Git commands fail or look “empty” if the terminal is in `C:\Users\dell` instead of the project.

**Windows PowerShell (this PC):**

```powershell
cd "C:\Users\dell\Desktop\Child Safety Programme"
git status
```

You should see `On branch main` and a list of changed files. If you see `not a git repository`, you are in the wrong folder.

**cPanel SSH (live server):**

```bash
source ~/nodevenv/halo/20/bin/activate
cd ~/halo
```

The prompt must show `(halo 20)` before Node or Prisma commands.

---

## 1. This PC — save, commit, push to GitHub

Do this after the work in Cursor is finished and you have reviewed the files.

### 1a. See what changed

```powershell
cd "C:\Users\dell\Desktop\Child Safety Programme"
git status
git diff
```

### 1b. Stage the files you want

```powershell
git add -A
git status
```

**Never add these** (they are gitignored on purpose):

- `.env` / `.env.local` (secrets)
- `iqpigeon/` (separate WhatsApp PHP app)
- `next-build.tar.gz` / `.next/` (build output)
- `node_modules/`

If `git add` offers to include them, stop and unstage:

```powershell
git restore --staged .env
git restore --staged iqpigeon
git restore --staged next-build.tar.gz
```

### 1c. Commit

```powershell
git commit -m "Describe why this change exists"
```

Examples:

- `Add school-owner register, email verify, and password reset`
- `Prompt Chrome for camera on enrollment and terminal QR pages`

If Git says `nothing to commit`, the files are already committed. Skip to push.

### 1d. Push to GitHub

```powershell
git push origin main
```

Confirm on GitHub: https://github.com/haydenak63/child-school-safety

That is the **push** half. GitHub is updated. The live site is not yet.

---

## 2. This PC — build for the live server (required)

Source `git pull` on cPanel is not enough for Next.js pages. The server cannot compile the app. Build on Windows, then upload the archive.

```powershell
cd "C:\Users\dell\Desktop\Child Safety Programme"
npm install
npx prisma generate
npm run build
npm run package:build
```

You should get `next-build.tar.gz` in the project folder.

Upload **only** that file to `~/halo` (cPanel File Manager or SCP). Do not upload `.env` from this PC.

---

## 3. Live server — pull, migrate, install the build, restart

SSH into cPanel, then run **in this order**.

### 3a. Activate Node and open the app

```bash
source ~/nodevenv/halo/20/bin/activate
cd ~/halo
```

### 3b. Pull the new source from GitHub

```bash
git status
git pull origin main
```

If pull complains about local edits on the server, do not force-reset. Copy the error and fix those files first, or stash them:

```bash
git stash
git pull origin main
git stash pop
```

### 3c. Install packages (only if `package.json` or `package-lock.json` changed)

```bash
npm install
```

### 3d. Update the database (only if `prisma/` changed)

```bash
npx prisma generate
npx prisma migrate deploy
```

If `npx prisma` crashes or core-dumps on the host, use:

```bash
node ./node_modules/prisma/build/index.js migrate deploy
```

Do **not** run `npx prisma db seed` on production unless you intend to recreate demo data.

Do **not** run `npm run build` on the server.

Do **not** run the seed with `tsx`.

### 3e. Install the Windows build you uploaded

The archive must already be at `~/halo/next-build.tar.gz`.

```bash
bash scripts/deploy-build.sh
```

You should see `Installed build …`.

### 3f. Restart the Node app

cPanel → **Setup Node.js App** → the Halo app → **Restart**.

Passenger will start `server.js`.

### 3g. Smoke-check

Open https://css.iqpigeon.com

- Marketing site loads
- `/login` loads
- New routes from this change load (for example `/register`, `/forgot-password`)
- After the auth migration: Settings no longer crashes
- Phone camera: open an enrollment or terminal link on **HTTPS**, tap **Enable camera**, Allow in Chrome

---

## 4. When do I skip a step?

| What you changed | Push GitHub | `npm install` on server | `migrate deploy` | Windows build + `deploy-build.sh` | Restart Node |
| --- | --- | --- | --- | --- | --- |
| Only docs / comments | Yes | No | No | No | No |
| React/TS pages, CSS, APIs | Yes | No | No | **Yes** | **Yes** |
| `package.json` / lockfile | Yes | **Yes** | Maybe | **Yes** | **Yes** |
| `prisma/schema.prisma` or `prisma/migrations/` | Yes | Usually | **Yes** | **Yes** | **Yes** |
| `.env` on the server only | No (never commit) | No | No | No | **Yes** |
| IQ Pigeon PHP files | No — not this repo | — | — | — | — |

---

## 5. Pull onto another PC (or a fresh clone)

```powershell
cd "C:\Users\dell\Desktop"
git clone https://github.com/haydenak63/child-school-safety.git "Child Safety Programme"
cd "Child Safety Programme"
copy .env.example .env
```

Edit `.env` (never copy production secrets into Git). Then:

```powershell
npm install
npx prisma migrate deploy
npm run dev
```

To update an existing clone:

```powershell
cd "C:\Users\dell\Desktop\Child Safety Programme"
git pull origin main
npm install
npx prisma migrate deploy
```

---

## 6. Production `.env` checklist

Keep these on the **server** `.env` only. After changing them, restart Node.

```env
DATABASE_URL="postgresql://...@127.0.0.1:5432/iqpigeon_css_db"
AUTH_SECRET="at-least-32-characters"
NEXT_PUBLIC_APP_URL="https://css.iqpigeon.com"
```

`NEXT_PUBLIC_APP_URL` **must** be `https://…` or Chrome on phones will not ask for the camera.

SMTP can be set here **or** in Settings → Integrations after you sign in as the platform operator.

---

## 7. Common problems

**`git pull` / `git push` does nothing**  
The terminal was not in `Child Safety Programme`. Run `cd` first, then `git status`.

**Live site still shows old pages after `git pull`**  
You pulled source but did not upload `next-build.tar.gz` and run `bash scripts/deploy-build.sh`, or you did not restart Node.

**`/settings` or login errors after pull**  
A Prisma migration was not applied. Run `npx prisma migrate deploy` on the server.

**`next build` fails on cPanel**  
Expected. Build on Windows only.

**Camera permission never appears on the phone**  
The page is `http://` not `https://`, or Chrome already blocked the camera for the site. Use https://css.iqpigeon.com and set Camera to Allow.

**IQ Pigeon WhatsApp files**  
They live in `iqpigeon/` on this PC and are **not** in GitHub. Upload those PHP files by hand. Never commit `config.php`.

**Do not change**

- `next.config.js` into `next.config.ts`
- Seed from `node prisma/seed.mjs` to `tsx`

---

## 8. Copy-paste cheat sheet

**Windows (after Cursor finishes):**

```powershell
cd "C:\Users\dell\Desktop\Child Safety Programme"
git status
git add -A
git commit -m "Your message"
git push origin main
npm install
npx prisma generate
npm run build
npm run package:build
```

Then upload `next-build.tar.gz` to `~/halo`.

**cPanel:**

```bash
source ~/nodevenv/halo/20/bin/activate
cd ~/halo
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
bash scripts/deploy-build.sh
```

Then **Restart** the Node.js app in cPanel.
