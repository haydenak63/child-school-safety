"use client";

import { useEffect, useState } from "react";
import { FingerprintCamera } from "@/components/fingerprint-camera";
import { api, errorMessage } from "@/lib/client/api";
import { DemoBanner } from "@/components/demo-banner";

export function EnrollCapture({
  token,
  studentName,
  expiresAt,
}: {
  token: string;
  studentName: string;
  expiresAt: string;
}) {
  const [status, setStatus] = useState<"ready" | "processing" | "success" | "error">("ready");
  const [message, setMessage] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function tick() {
      setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [expiresAt]);

  async function onCapture(image: string, meta: { width: number; height: number }) {
    setStatus("processing");
    setMessage("Processing fingerprint...");
    setDiagnostics(`${meta.width}×${meta.height}`);
    try {
      const result = await api<{ diagnostics?: { quality: number } }>("/api/enrollment/capture", {
        method: "POST",
        body: JSON.stringify({ token, image }),
      });
      setStatus("success");
      setMessage("Fingerprint enrolled successfully");
      if (result.diagnostics?.quality != null) {
        setDiagnostics(
          `${meta.width}×${meta.height} · quality ${Math.round(result.diagnostics.quality * 100)}% · template created`,
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error, "Network failure. Check your connection and try again."));
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <DemoBanner />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <div>
            <p className="text-5xl text-ok">✓</p>
            <h1 className="mt-4 text-2xl font-semibold">Fingerprint enrolled successfully</h1>
            <p className="mt-3 text-ink-muted">You may close this page.</p>
            {diagnostics ? <p className="mt-4 text-xs text-ink-muted">{diagnostics}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-6">
      <DemoBanner />
      <div className="mx-auto max-w-md space-y-5 pt-4">
        <div className="text-center">
          <p className="eyebrow">Secure enrollment</p>
          <h1 className="mt-2 text-2xl font-semibold">Fingerprint enrollment</h1>
          <p className="mt-3 text-sm text-ink-muted">Student</p>
          <p className="text-xl font-semibold">{studentName}</p>
        </div>
        <ul className="rounded-2xl border border-line bg-surface px-4 py-4 text-sm leading-6 text-ink-soft">
          <li>Use good lighting</li>
          <li>Keep the finger steady</li>
          <li>Fill the guide area</li>
          <li>Keep the finger clean and dry</li>
        </ul>
        <FingerprintCamera
          onCapture={onCapture}
          busy={status === "processing"}
          captureLabel="Capture fingerprint"
        />
        {message ? (
          <p className={`text-center text-sm ${status === "error" ? "text-danger" : "text-ink-muted"}`}>
            {message}
          </p>
        ) : null}
        {diagnostics ? <p className="text-center text-xs text-ink-muted">{diagnostics}</p> : null}
        <p className="text-center text-xs text-ink-muted">
          Link expires in {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
