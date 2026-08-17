import {
  assertUsableFingerprint,
  fingerprintService,
  parseTemplate,
  serializeTemplate,
} from "@/lib/biometric/engine";
import { bufferToGrayImage } from "@/lib/biometric/image";
import { BiometricError } from "@/lib/biometric/errors";
import type { BiometricProvider, MatchResult, Template, TemplateRecord } from "@/lib/biometric/types";

export class CameraFingerprintProvider implements BiometricProvider {
  async enroll(image: Buffer): Promise<Template> {
    const gray = await bufferToGrayImage(image);
    assertUsableFingerprint(gray);
    return serializeTemplate(fingerprintService.createTemplate(gray));
  }

  async verify(image: Buffer, template: Template): Promise<MatchResult> {
    const gray = await bufferToGrayImage(image);
    assertUsableFingerprint(gray);
    const payload = parseTemplate(template);
    const result = fingerprintService.match(gray, payload);
    return {
      ...result,
      matched: result.score >= 0.58,
      confidence: result.score,
    };
  }

  async identify(image: Buffer, gallery: TemplateRecord[], threshold = 0.58): Promise<MatchResult> {
    const gray = await bufferToGrayImage(image);
    assertUsableFingerprint(gray);
    if (gallery.length === 0) {
      throw new BiometricError(
        "NO_MATCH",
        "No student matched. Enroll a fingerprint before using this terminal.",
      );
    }
    const parsed = gallery.map((item) => ({
      studentId: item.studentId,
      template: parseTemplate(item.template),
    }));
    return fingerprintService.identify(gray, parsed, threshold);
  }
}
