# API documentation

All JSON APIs are same-origin. Admin endpoints require the `csp_admin` session cookie. Enrollment and terminal endpoints authenticate with the secret token in the request body, not the student/terminal database id.

Biometric templates are never included in responses.

## Auth

### POST `/api/auth/login`

```json
{ "email": "admin@abcschool.test", "password": "..." }
```

### POST `/api/auth/logout`

## Students

### POST `/api/students`

Creates a student. Optional nested `parent`.

```json
{
  "studentNumber": "STU-001",
  "firstName": "Ali",
  "lastName": "Ahmed",
  "className": "Grade 5",
  "section": "B",
  "parent": {
    "name": "Muhammad Ahmed",
    "relationship": "Father",
    "whatsappNumber": "+923001110001",
    "isPrimary": true
  }
}
```

### GET `/api/students`

### GET `/api/students/:id`

### PATCH `/api/students/:id`

### DELETE `/api/students/:id`

Deactivates the student (`INACTIVE`).

### POST `/api/students/:id/parents`

Associates another parent.

## Enrollment

### POST `/api/enrollment/create`

Admin only. Creates a hashed, single-use token that expires in 5 minutes.

```json
{ "studentId": "..." }
```

Returns `{ url, expiresAt, qrDataUrl }`. The raw student id is not placed in the URL.

### POST `/api/enrollment/capture`

Public to holders of a valid enrollment token. Rate limited.

```json
{ "token": "SECURE_TOKEN", "image": "data:image/jpeg;base64,..." }
```

Runs `BiometricProvider.enroll()`, stores the encrypted template, invalidates the session, and discards the image.

## Biometric

### POST `/api/biometric/identify`

Rate limited. Requires a live terminal token.

```json
{ "terminalToken": "abc123...", "image": "data:image/jpeg;base64,..." }
```

Runs `BiometricProvider.identify()` against enrolled templates for that school. Does not write attendance. Returns the matched student and confidence, or `NO_MATCH` / `QUALITY_POOR` / `NO_FINGERPRINT`.

## Attendance

### POST `/api/attendance`

```json
{
  "terminalToken": "abc123...",
  "studentId": "...",
  "confidence": 0.86
}
```

Determines ARRIVAL vs DEPARTURE from today’s last event, enforces cooldown, writes `AttendanceEvent`, and generates a parent notification.

### GET `/api/attendance`

Admin filters: `date`, `studentId`, `terminalId`, `eventType`.

## Terminals

### POST `/api/terminals`

```json
{ "name": "Main Entrance", "location": "Front gate" }
```

### GET `/api/terminals`

Returns name, location, status, last activity, URL, and QR data URL.

### PATCH `/api/terminals/:id`

`status: "REVOKED"` revokes the terminal. `rotateToken: true` issues a new URL.

## Notifications

### POST `/api/notifications/test`

Admin only. Generates a mock WhatsApp payload without a live API.

## Settings

### GET `/api/settings`

### PATCH `/api/settings`

`scanCooldownSeconds`, `matchThreshold`, school name/address/timezone.
