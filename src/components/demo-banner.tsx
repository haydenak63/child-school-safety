import { isDemoMode } from "@/lib/env";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="border-b border-warn/20 bg-warn-soft px-4 py-1.5 text-center text-[11px] font-medium tracking-[0.12em] text-warn">
      DEMO MODE · CAMERA FINGERPRINT MATCHING IS A PROTOTYPE
    </div>
  );
}
