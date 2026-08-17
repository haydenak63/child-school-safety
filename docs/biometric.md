# Biometric architecture

## Prototype constraint

Fingerprint capture uses the **phone camera** (`getUserMedia`), not Android/iOS biometric APIs and not a government or cloud AFIS. Images are processed in this application only.

This matcher is **not** production-grade fingerprint recognition. It is a real comparison of the captured finger image so the demo loop can complete without faking a match.

## Why not SourceAFIS?

SourceAFIS is the usual open-source minutiae matcher, but the maintained JS wrappers drive a **Java** engine (`node-java`). That is a poor fit for a Next.js app meant to deploy on ordinary Node hosting. There is no reliable browser-only SourceAFIS build.

## Abstraction

```text
BiometricProvider
  ├── enroll(image): Promise<Template>
  ├── verify(image, template): Promise<MatchResult>
  └── identify(image, gallery, threshold?): Promise<MatchResult>

FingerprintService
  ├── enroll(image)
  ├── createTemplate(image)
  ├── match(image, template)
  └── identify(image, templates)
```

Current implementation: `CameraFingerprintProvider` → `FingerprintService` (`src/lib/biometric/engine.ts`).

Future implementation: `HardwareFingerprintProvider` (`src/lib/biometric/hardware-provider.ts`).

Factory: `getBiometricProvider()` in `src/lib/biometric/provider.ts`, selected by `BIOMETRIC_PROVIDER=camera|hardware`.

Students, parents, attendance, terminals, notifications, dashboard, and Prisma models talk only to this interface. They never import camera math.

## Camera pipeline

1. Client crops to the oval guide and masks the background.
2. Server validates JPEG/PNG/WebP, max 2 MB.
3. `sharp` decodes, converts to grayscale, resizes to 192×256.
4. Quality checks: finger coverage, blur (Laplacian variance), contrast.
5. Alignment to the dark-pixel centroid, histogram equalization.
6. Template features (not a stored photograph):
   - LBP histogram
   - HOG
   - 32×32 mean/std-normalized patch
   - difference hash
7. Match score is a weighted combination. School `matchThreshold` (default 0.58) decides match vs no-match.
8. Template JSON is AES-256-GCM encrypted with `AUTH_SECRET` before insert. Raw images are not persisted.

## Replacing CameraFingerprintProvider with hardware

1. Integrate the vendor SDK in `HardwareFingerprintProvider`.
2. `enroll` should return `{ format, data, quality }` where `data` is the vendor template (or an opaque blob). Do not store raw sensor dumps if the SDK provides templates.
3. `identify` should search the gallery of stored templates using the vendor matcher.
4. Set `BIOMETRIC_PROVIDER=hardware`.
5. Leave attendance event types, cooldown, WhatsApp notifications, and admin UI unchanged.

Keep `FingerprintTemplate.templateData` as an opaque encrypted string so the column does not need to change.

## Diagnostics

With `NEXT_PUBLIC_DEMO_MODE=true`, `/settings/diagnostics` shows capture dimensions, quality, confidence, processing time, and match outcome. Template bytes are never shown.
