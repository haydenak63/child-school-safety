"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  applyCloseUpFocus,
  focusAtPoint,
  openCloseUpCamera,
  prefersAutoCameraStart,
} from "@/lib/camera-focus";

const noopSubscribe = () => () => {};

type Props = {
  onCapture: (image: string, meta: { width: number; height: number }) => void;
  busy?: boolean;
  captureLabel?: string;
  kiosk?: boolean;
};

function cameraErrorMessage(err: unknown): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Phone cameras require HTTPS. Open the secure link, then tap Allow when Chrome asks for the camera.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser cannot access the camera. Use the camera app button below.";
  }
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Chrome blocked the camera. Tap Allow on the permission prompt, or enable Camera for this site in Chrome settings.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found. Close other camera apps and try again.";
  }
  if (name === "NotReadableError") {
    return "The camera is already in use by another app. Close it and try again.";
  }
  if (name === "NotSupportedError") {
    return "This browser cannot access the camera. Use the camera app button below.";
  }
  return err instanceof Error ? err.message : "Could not start the camera.";
}

function fingerprintJpegFromSource(
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
): string | null {
  const canvas = document.createElement("canvas");
  const cropW = Math.round(sourceW * 0.62);
  const cropH = Math.round(sourceH * 0.78);
  const sx = Math.round((sourceW - cropW) / 2);
  const sy = Math.round((sourceH - cropH) / 2);
  canvas.width = 384;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.38,
    canvas.height * 0.42,
    0,
    0,
    Math.PI * 2,
  );
  ctx.clip();
  ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.92);
}

export function FingerprintCamera({
  onCapture,
  busy,
  captureLabel = "Capture Fingerprint",
  kiosk = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const insecure = useSyncExternalStore(
    noopSubscribe,
    () => !window.isSecureContext,
    () => false,
  );
  const httpsUrl = useSyncExternalStore(
    noopSubscribe,
    () =>
      window.isSecureContext
        ? ""
        : `https://${window.location.host}${window.location.pathname}${window.location.search}`,
    () => "",
  );

  async function attachStream(stream: MediaStream) {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("Camera preview is not ready. Tap Enable camera again.");
    }
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    video.autoplay = true;
    video.srcObject = stream;
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }
      video.onloadedmetadata = () => resolve();
      window.setTimeout(() => resolve(), 800);
    });
    try {
      await video.play();
    } catch {
      // Preview can still render from the stream after a gesture.
    }
    const track = stream.getVideoTracks()[0];
    if (track) await applyCloseUpFocus(track);
    setReady(true);
  }

  async function startCamera() {
    if (startingRef.current || ready) return;
    startingRef.current = true;
    setError(null);
    setStarting(true);
    try {
      if (!window.isSecureContext) throw new Error("insecure");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await openCloseUpCamera();
      await attachStream(stream);
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setReady(false);
      setError(cameraErrorMessage(err));
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }

  useEffect(() => {
    if (prefersAutoCameraStart()) {
      void startCamera();
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
    // Start once when the QR enrollment / terminal page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onTapPreview(event: PointerEvent<HTMLDivElement>) {
    if (!ready) {
      event.preventDefault();
      await startCamera();
      return;
    }
    const track = streamRef.current?.getVideoTracks()[0];
    const target = event.currentTarget.getBoundingClientRect();
    if (!track) return;
    setFocusing(true);
    await focusAtPoint(
      track,
      (event.clientX - target.left) / target.width,
      (event.clientY - target.top) / target.height,
    );
    window.setTimeout(() => setFocusing(false), 700);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const image = fingerprintJpegFromSource(
      video,
      video.videoWidth || 480,
      video.videoHeight || 640,
    );
    if (!image) return;
    onCapture(image, { width: 384, height: 512 });
  }

  function onFileCapture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const imageEl = new Image();
    imageEl.onload = () => {
      const image = fingerprintJpegFromSource(imageEl, imageEl.naturalWidth, imageEl.naturalHeight);
      URL.revokeObjectURL(objectUrl);
      if (!image) return;
      onCapture(image, { width: 384, height: 512 });
    };
    imageEl.onerror = () => URL.revokeObjectURL(objectUrl);
    imageEl.src = objectUrl;
  }

  const primary = kiosk
    ? "w-full min-h-14 rounded-2xl bg-white px-4 py-4 text-base font-semibold text-ink disabled:opacity-50"
    : "w-full min-h-14 rounded-2xl bg-brand px-4 py-4 text-base font-semibold text-white disabled:opacity-50";
  const secondary = kiosk
    ? "w-full min-h-12 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white"
    : "w-full min-h-12 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-semibold text-ink";

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[28px] bg-slate-900 shadow-xl"
        onPointerDown={onTapPreview}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          controls={false}
          className="aspect-[3/4] w-full object-cover sm:aspect-[4/5]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[72%] w-[58%] rounded-[46%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)] animate-pulse-ring" />
        </div>
        <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-2xl bg-black/45 px-4 py-3 text-sm text-white">
          {starting
            ? "Waiting for camera permission…"
            : focusing
              ? "Focusing…"
              : busy
                ? "Processing…"
                : ready
                  ? "Hold the finger 8–12 cm away, fill the oval, then tap to focus."
                  : "Tap the oval, then tap Allow when Chrome asks for the camera."}
        </div>
        {!ready && !starting ? (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              void startCamera();
            }}
            disabled={insecure}
            className="absolute inset-x-6 bottom-6 z-10 min-h-12 rounded-2xl bg-white px-4 text-sm font-semibold text-ink"
          >
            Enable camera
          </button>
        ) : null}
      </div>
      {insecure ? (
        <div className="space-y-3 rounded-2xl bg-warn-soft px-4 py-4 text-sm text-warn">
          <p className="font-semibold">Camera access is unavailable on HTTP.</p>
          <p>
            Chrome on a phone only asks for camera permission on HTTPS. Open this same page
            securely, then tap Enable camera and Allow.
          </p>
          {httpsUrl ? (
            <a href={httpsUrl} className="block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white">
              Open HTTPS camera page
            </a>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFileCapture}
      />
      {!ready ? (
        <div className="grid gap-3">
          <button type="button" onClick={startCamera} disabled={starting || insecure} className={primary}>
            {starting ? "Waiting for permission..." : "Enable camera"}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={secondary}>
            Use camera app instead
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              const track = streamRef.current?.getVideoTracks()[0];
              if (!track) return;
              setFocusing(true);
              void focusAtPoint(track, 0.5, 0.5).finally(() => {
                window.setTimeout(() => setFocusing(false), 700);
              });
            }}
            className={secondary}
          >
            Refocus
          </button>
          <button type="button" onClick={capture} disabled={busy} className={primary}>
            {busy ? "Processing fingerprint..." : captureLabel}
          </button>
        </div>
      )}
    </div>
  );
}
