import { CameraFingerprintProvider } from "@/lib/biometric/camera-provider";
import { HardwareFingerprintProvider } from "@/lib/biometric/hardware-provider";
import { getBiometricProviderName } from "@/lib/env";
import type { BiometricProvider } from "@/lib/biometric/types";

let instance: BiometricProvider | undefined;

export function getBiometricProvider(): BiometricProvider {
  if (!instance) {
    instance = getBiometricProviderName() === "hardware"
      ? new HardwareFingerprintProvider()
      : new CameraFingerprintProvider();
  }
  return instance;
}
