# Manual testing

Use a real phone camera. Do not skip enrollment and pretend a match occurred.

1. `npm run dev` and sign in at `/login`.
2. Open **Students**. Create **Ali Ahmed** (or use the seeded row) in Grade 5 Section B.
3. Confirm a parent exists with a WhatsApp number such as `+923001110001`.
4. Open the student page. Fingerprint should read **Not enrolled**.
5. Click **Enroll Fingerprint** and generate the QR code. Confirm the countdown starts under 5:00.
6. Scan the QR with the phone (same LAN URL if not on localhost).
7. Allow camera permission. Place a finger in the oval. Use good lighting, keep still, fill the guide.
8. Tap **Capture Fingerprint**. Wait for **Fingerprint enrolled successfully**.
9. Confirm the student page now shows **✓ Enrolled**.
10. Open **Terminals** and scan **Main Entrance**.
11. On the terminal page, wait until **READY**, then capture the **same** finger.
12. Confirm the screen shows **ALI AHMED** / **ARRIVED** / time / **Main Entrance**, then resets after ~2 seconds.
13. Open **Dashboard** and **Attendance**. Confirm an ARRIVAL row and a mock WhatsApp arrival message.
14. Wait 10 seconds (cooldown). Scan again.
15. Confirm **DEPARTED**, a DEPARTURE row, and a second notification.

Failure cases to try:

- Deny camera permission → permission error, no attendance.
- Capture an empty scene → “No fingerprint detected” or “Fingerprint not clear enough”.
- Capture a different finger / person after Ali is enrolled → no match, no attendance.
- Reuse an enrollment QR after success → already used.
- Wait 5+ minutes before scanning enrollment QR → expired.
- Revoke a terminal and reopen its URL → unauthorized.
