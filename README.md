# Child Safety School Entry & Exit System

Prototype web application for school child safety: enroll a student, capture a fingerprint with a **phone camera**, store a biometric template, then identify the same finger at a gate terminal, record ARRIVAL/DEPARTURE, and generate a parent WhatsApp notification.

This is a **prototype**, not a production biometric security system. Camera-based fingerprint matching is not production-grade. It does **not** use the phone’s native fingerprint sensor, NADRA, or any external biometric service.

A **DEMO MODE** banner is shown throughout the app.

## What works

The required loop is implemented with a real camera capture and a real image comparison:

1. Admin creates a student and parent.
2. Admin starts fingerprint enrollment and shows a one-time QR code (5-minute expiry, hashed token).
3. Phone opens `/enroll/[token]`, captures a fingerprint with the rear camera, and sends the image to the backend.
4. `CameraFingerprintProvider` processes the image, builds a template, and stores it encrypted. The raw photo is discarded.
5. A gate terminal at `/terminal/[token]` captures the same finger.
6. The probe is matched against enrolled templates.
7. On a real match, the system records ARRIVAL or DEPARTURE, then a `MockWhatsAppProvider` notification.
8. A second scan records the opposite event and a second notification.

If matching fails, attendance is **not** recorded.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Session auth (`iron-session`, httpOnly cookies)
- Browser `getUserMedia` camera capture
- Modular `BiometricProvider` / `NotificationService`

## Local development

### 1. Requirements

- Node.js 20+
- PostgreSQL 16 (Docker is the simplest path)
- A phone or laptop camera on `http://localhost:3000` or HTTPS

### 2. Configure environment

```bash
cp .env.example .env
```

Set at least:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/child_safety?schema=public"
AUTH_SECRET="dev-only-change-me-use-at-least-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@abcschool.test"
ADMIN_PASSWORD="ChangeMeNow123!"
NEXT_PUBLIC_DEMO_MODE="true"
```

Do not hardcode production credentials. WhatsApp Cloud variables are optional; the mock provider is the default.

### 3. Start PostgreSQL

```bash
docker compose up -d
```

If Docker is unavailable, point `DATABASE_URL` at any PostgreSQL instance (Neon, local install, etc.).

### 4. Install, migrate, seed

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Seed data:

- School: ABC International School
- Students: Ali Ahmed, Sara Khan, Hamza Malik
- Parents with dummy `+92…` WhatsApp numbers
- Terminals: Main Entrance, Main Exit (URLs printed in the seed output)

Fingerprints are **not** seeded. Enroll them with a camera.

### 5. Phone testing

Use the same origin in `NEXT_PUBLIC_APP_URL` that the phone will open.

- Laptop + phone on the same Wi-Fi: set `NEXT_PUBLIC_APP_URL` to `http://YOUR_LAN_IP:3000` and restart `npm run dev`.
- Camera APIs require a secure context: localhost or HTTPS.

## Tests

```bash
npm test
```

Covered:

- Student / parent validation
- Enrollment token hashing, expiry, and reuse
- Successful fingerprint enrollment (template creation)
- Fingerprint match and mismatch
- Identification among multiple templates
- Arrival / departure toggling
- Duplicate-scan cooldown
- Terminal token hashing
- Mock WhatsApp arrival and departure messages

## Manual test procedure

1. Create Ali Ahmed (or use the seeded student).
2. Add a parent with a WhatsApp number.
3. Open the student page and start fingerprint enrollment.
4. Scan the QR code with a phone.
5. Place a finger in the guide and capture.
6. Confirm “Fingerprint enrolled successfully”.
7. Open the Main Entrance terminal QR on the phone.
8. Capture the same finger.
9. Verify Ali Ahmed is identified.
10. Verify ARRIVAL is recorded and a mock WhatsApp notification appears on the dashboard.
11. Scan again after the 10-second cooldown.
12. Verify DEPARTURE is recorded and a second notification is generated.

Detailed copy: [docs/manual-testing.md](docs/manual-testing.md).

## Deployment

1. Provision PostgreSQL.
2. Set production env vars, including a strong `AUTH_SECRET` (32+ characters) and `NEXT_PUBLIC_APP_URL` as the public HTTPS origin.
3. `npx prisma migrate deploy && npx prisma db seed` (or skip seed in production).
4. `npm run build && npm start`, or deploy to a Node host (Railway, Render, Fly, a VPS).
5. Serve over HTTPS so mobile cameras work.
6. Keep `NEXT_PUBLIC_DEMO_MODE=false` if you want diagnostics hidden.

Vercel can host the Next.js app if the database is reachable. `sharp` is used on the server for image decode.

## API

See [docs/api.md](docs/api.md).

## Biometric architecture

See [docs/biometric.md](docs/biometric.md).

To replace the camera prototype with a hardware scanner later, implement `HardwareFingerprintProvider` with the same `BiometricProvider` methods (`enroll`, `verify`, `identify`) and set `BIOMETRIC_PROVIDER=hardware`. Students, parents, attendance, terminals, notifications, dashboard, and the database schema do not need to change.

## Security notes (prototype)

- Admin passwords are hashed with bcrypt.
- Admin routes require a session cookie.
- Enrollment and terminal secrets are stored as SHA-256 hashes.
- Enrollment URLs are single-use and expire in 5 minutes.
- Fingerprint templates are AES-256-GCM encrypted at rest and never returned by frontend APIs.
- Raw fingerprint photographs are not stored.
- Biometric endpoints are rate-limited.
- Image type and size are validated.

## Limitations

Phone-camera fingerprint photos are not ink-card or hardware-sensor prints. Lighting, motion, and skin oil affect scores. The matcher uses enhanced-image texture features (LBP, HOG, normalized patch, difference hash), not a production AFIS minutiae engine such as SourceAFIS. That is intentional: a Java/SourceAFIS stack would block normal Node hosting. The provider interface is the replacement point for dedicated hardware.
