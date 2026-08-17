"use client";

import { useState } from "react";
import { FingerprintCamera } from "@/components/fingerprint-camera";
import { api, errorMessage } from "@/lib/client/api";

type Phase = "ready" | "searching" | "success" | "error";

type SuccessState = {
  name: string;
  eventType: "ARRIVAL" | "DEPARTURE";
  timeLabel: string;
  terminalName: string;
};

export function TerminalKiosk({
  token,
  terminalName,
}: {
  token: string;
  terminalName: string;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [message, setMessage] = useState("Place your finger in front of the camera.");
  const [success, setSuccess] = useState<SuccessState | null>(null);

  async function onCapture(image: string) {
    setPhase("searching");
    setMessage("Fingerprint detected. Searching...");
    try {
      const identified = await api<{
        student: { id: string; name: string };
        confidence: number;
        terminal: { name: string };
      }>("/api/biometric/identify", {
        method: "POST",
        body: JSON.stringify({ terminalToken: token, image }),
      });

      const recorded = await api<{
        eventType: "ARRIVAL" | "DEPARTURE";
        timeLabel: string;
        terminal: { name: string };
        student: { name: string };
        confidence: number;
      }>("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          terminalToken: token,
          studentId: identified.student.id,
          confidence: identified.confidence,
        }),
      });

      setSuccess({
        name: recorded.student.name,
        eventType: recorded.eventType,
        timeLabel: recorded.timeLabel,
        terminalName: recorded.terminal.name,
      });
      setPhase("success");
      window.setTimeout(() => {
        setPhase("ready");
        setSuccess(null);
        setMessage("Ready for next scan");
      }, 2000);
    } catch (error) {
      const err = error as Error & { code?: string };
      setPhase("error");
      if (err.code === "NO_MATCH") {
        setMessage("We couldn't identify this fingerprint. Reposition and try again.");
      } else if (err.code === "QUALITY_POOR" || err.code === "NO_FINGERPRINT") {
        setMessage(err.message);
      } else if (err.code === "COOLDOWN") {
        setMessage(err.message);
      } else if (err.code === "TERMINAL_UNAUTHORIZED") {
        setMessage("This terminal is unauthorized or has been revoked.");
      } else {
        setMessage(errorMessage(error, "Connection interrupted. Try again."));
      }
      window.setTimeout(() => {
        setPhase("ready");
        setMessage("Ready for next scan");
      }, 2500);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <p className="text-center text-xs font-semibold tracking-[0.22em] text-white/40">
          ATTENDANCE TERMINAL
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-wide sm:text-4xl">
          {terminalName.toUpperCase()}
        </h1>
        <p
          className={`mt-4 text-center text-lg font-semibold ${
            phase === "success"
              ? "text-emerald-300"
              : phase === "error"
                ? "text-red-300"
                : "text-teal-200"
          }`}
        >
          {phase === "ready" ? "● READY" : phase === "searching" ? "SEARCHING" : phase === "success" ? "RECORDED" : "TRY AGAIN"}
        </p>
        {phase === "success" && success ? (
          <div className="mt-10 rounded-[28px] bg-white p-8 text-center text-ink">
            <p className="text-5xl text-ok">✓</p>
            <p className="mt-4 text-3xl font-semibold">{success.name.toUpperCase()}</p>
            <p className={`mt-2 text-2xl font-bold ${success.eventType === "ARRIVAL" ? "text-ok" : "text-brand"}`}>
              {success.eventType === "ARRIVAL" ? "ARRIVED" : "DEPARTED"}
            </p>
            <p className="mt-4 text-ink-muted">{success.timeLabel}</p>
            <p className="text-ink-muted">{success.terminalName}</p>
          </div>
        ) : (
          <div className="mt-6 flex-1">
            <FingerprintCamera
              onCapture={onCapture}
              busy={phase === "searching"}
              captureLabel="Scan fingerprint"
              kiosk
            />
          </div>
        )}
        <p className="mt-6 text-center text-sm text-white/70">{message}</p>
      </div>
    </div>
  );
}
