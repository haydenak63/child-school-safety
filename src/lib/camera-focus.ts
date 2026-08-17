type TrackCaps = MediaTrackCapabilities & {
  focusMode?: string[];
  focusDistance?: { min: number; max: number };
  zoom?: { min: number; max: number };
  exposureMode?: string[];
  whiteBalanceMode?: string[];
  pointsOfInterest?: boolean;
};

function capsOf(track: MediaStreamTrack): TrackCaps {
  return (track.getCapabilities?.() ?? {}) as TrackCaps;
}

function scoreRearCamera(label: string): number {
  const name = label.toLowerCase();
  if (/front|user|face|depth|tof|tele/.test(name)) return -1;
  if (/ultra.?wide|ultrawide/.test(name)) return 1;
  if (/wide/.test(name) && !/ultra/.test(name)) return 4;
  if (/macro/.test(name)) return 10;
  if (/back|rear|environment|camera2 0|camera 0/.test(name)) return 8;
  return 3;
}

export async function openCloseUpCamera(): Promise<MediaStream> {
  const seed = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  });

  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const best = [...cameras].sort((a, b) => scoreRearCamera(b.label) - scoreRearCamera(a.label))[0];
  const currentId = seed.getVideoTracks()[0]?.getSettings().deviceId;

  if (best?.deviceId && best.deviceId !== currentId && scoreRearCamera(best.label) >= 4) {
    seed.getTracks().forEach((track) => track.stop());
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: { exact: best.deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    } catch {
      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
    }
  }

  return seed;
}

export async function applyCloseUpFocus(track: MediaStreamTrack): Promise<void> {
  const caps = capsOf(track);
  const advanced: Record<string, unknown> = {};

  if (caps.focusMode?.includes("continuous")) {
    advanced.focusMode = "continuous";
  } else if (caps.focusMode?.includes("single-shot")) {
    advanced.focusMode = "single-shot";
  } else if (caps.focusMode?.includes("manual")) {
    advanced.focusMode = "manual";
  }

  if (caps.focusDistance) {
    advanced.focusDistance = caps.focusDistance.min;
  }

  if (caps.zoom) {
    const span = caps.zoom.max - caps.zoom.min;
    advanced.zoom = Math.min(caps.zoom.max, caps.zoom.min + span * 0.12);
  }

  if (caps.exposureMode?.includes("continuous")) {
    advanced.exposureMode = "continuous";
  }
  if (caps.whiteBalanceMode?.includes("continuous")) {
    advanced.whiteBalanceMode = "continuous";
  }

  const attempts: MediaTrackConstraints[] = [
    { advanced: [advanced] } as unknown as MediaTrackConstraints,
    ...(advanced.focusMode
      ? ([{ focusMode: advanced.focusMode }] as unknown as MediaTrackConstraints[])
      : []),
    { advanced: [{ focusMode: "continuous" }] } as unknown as MediaTrackConstraints,
  ];

  for (const constraints of attempts) {
    try {
      await track.applyConstraints(constraints);
      return;
    } catch {
      // try the next supported constraint set
    }
  }
}

export async function focusAtPoint(
  track: MediaStreamTrack,
  x: number,
  y: number,
): Promise<void> {
  const caps = capsOf(track);
  const point = {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };

  const attempts: MediaTrackConstraints[] = [];
  if (caps.pointsOfInterest) {
    attempts.push({
      advanced: [{ pointsOfInterest: [point], focusMode: "single-shot" }],
    } as unknown as MediaTrackConstraints);
  }
  if (caps.focusMode?.includes("single-shot")) {
    attempts.push({ advanced: [{ focusMode: "single-shot" }] } as unknown as MediaTrackConstraints);
  }
  attempts.push({ advanced: [{ focusMode: "continuous" }] } as unknown as MediaTrackConstraints);

  for (const constraints of attempts) {
    try {
      await track.applyConstraints(constraints);
      break;
    } catch {
      // continue
    }
  }

  window.setTimeout(() => {
    void applyCloseUpFocus(track);
  }, 500);
}
