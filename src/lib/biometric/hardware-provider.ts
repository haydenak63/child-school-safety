import { AppError } from "@/lib/errors";
import type { BiometricProvider, MatchResult, Template, TemplateRecord } from "@/lib/biometric/types";

export class HardwareFingerprintProvider implements BiometricProvider {
  async enroll(_image: Buffer): Promise<Template> {
    throw new AppError(
      "SERVER",
      "HardwareFingerprintProvider is not wired yet. Connect a dedicated fingerprint scanner SDK here.",
      501,
    );
  }

  async verify(_image: Buffer, _template: Template): Promise<MatchResult> {
    throw new AppError(
      "SERVER",
      "HardwareFingerprintProvider is not wired yet. Connect a dedicated fingerprint scanner SDK here.",
      501,
    );
  }

  async identify(_image: Buffer, _gallery: TemplateRecord[], _threshold?: number): Promise<MatchResult> {
    throw new AppError(
      "SERVER",
      "HardwareFingerprintProvider is not wired yet. Connect a dedicated fingerprint scanner SDK here.",
      501,
    );
  }
}
