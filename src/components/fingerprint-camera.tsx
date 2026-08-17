"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import { applyCloseUpFocus, focusAtPoint, openCloseUpCamera } from "@/lib/camera-focus";

type Props = {
  onCapture: (image: string, meta: { width: number; height: number }) => void;
  busy?: boolean;
  captureLabel?: string;
  demo?: boolean;
  kiosk?: boolean;
};

function cameraErrorMessage(err: unknown): string {
  if (!window.isSecureContext) {
    return "Phone cameras require HTTPS. Open the HTTPS link below, accept the certificate warning, then tap Enable Camera.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser cannot access the camera.";
  }
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission denied. Allow camera access in the browser prompt or site settings, then try again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found. Close other camera apps and try again.";
  }
  if (name === "NotReadableError") {
    return "The camera is already in use by another app. Close it and try again.";
  }
  return err instanceof Error ? err.message : "Could not start the camera.";
}

export function FingerprintCamera({
  onCapture,
  busy,
  captureLabel = "Capture Fingerprint",
  demo = true,
  kiosk = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [insecure, setInsecure] = useState(false);
  const [httpsUrl, setHttpsUrl] = useState("");
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const secure = window.isSecureContext;
    setInsecure(!secure);
    if (!secure) {
      setHttpsUrl(
        `https://${window.location.host}${window.location.pathname}${window.location.search}`,
      );
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  async function attachStream(stream: MediaStream) {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    await video.play();
    const track = stream.getVideoTracks()[0];
    if (track) await applyCloseUpFocus(track);
    setReady(true);
    setDimensions({ width: video.videoWidth, height: video.videoHeight });
  }

  async function startCamera() {
    setError(null);
    setStarting(true);
    try {
      if (!window.isSecureContext) throw new Error("insecure");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await openCloseUpCamera();
      await attachStream(stream);
    } catch (err) {
      setReady(false);
      setError(cameraErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  async function onTapFocus(event: PointerEvent<HTMLDivElement>) {
    if (!ready) return;
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
    const canvas = document.createElement("canvas");
    const sourceW = video.videoWidth || 480;
    const sourceH = video.videoHeight || 640;
    const cropW = Math.round(sourceW * 0.62);
    const cropH = Math.round(sourceH * 0.78);
    const sx = Math.round((sourceW - cropW) / 2);
    const sy = Math.round((sourceH - cropH) / 2);
    canvas.width = 384;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    const image = canvas.toDataURL("image/jpeg", 0.92);
    setDimensions({ width: canvas.width, height: canvas.height });
    onCapture(image, { width: canvas.width, height: canvas.height });
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
        onPointerDown={onTapFocus}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="aspect-[3/4] w-full object-cover sm:aspect-[4/5]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[72%] w-[58%] rounded-[46%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)] animate-pulse-ring" />
        </div>
        <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-2xl bg-black/45 px-4 py-3 text-sm text-white">
          {starting
            ? "Initializing camera…"
            : focusing
              ? "Focusing…"
              : busy
                ? "Processing…"
                : ready
                  ? "Hold the finger 8–12 cm away, fill the oval, then tap to focus."
                  : "Enable the camera to begin."}
        </div>
      </div>
      {demo && dimensions ? (
        <p className={`text-center text-xs ${kiosk ? "text-white/50" : "text-ink-muted"}`}>
          Captured image target: {dimensions.width}×{dimensions.height}
        </p>
      ) : null}
      {insecure ? (
        <div className="space-y-3 rounded-2xl bg-warn-soft px-4 py-4 text-sm text-warn">
          <p className="font-semibold">Camera access is unavailable on HTTP.</p>
          <p>
            Phones only allow the camera on HTTPS. Open this same page securely, accept the
            certificate warning, then tap Enable Camera.
          </p>
          {httpsUrl ? (
            <a href={httpsUrl} className="block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white">
              Open HTTPS camera page
            </a>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p> : null}
      {!ready ? (
        <button type="button" onClick={startCamera} disabled={starting || insecure} className={primary}>
          {starting ? "Starting camera..." : "Enable camera"}
        </button>
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
