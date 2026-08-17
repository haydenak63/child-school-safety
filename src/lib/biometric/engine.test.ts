import { describe, expect, it } from "vitest";
import {
  fingerprintService,
  generateRidgeImage,
  identifyTemplate,
} from "@/lib/biometric/engine";
import { BiometricError } from "@/lib/biometric/errors";

describe("fingerprint matching", () => {
  it("creates a template from a captured-style fingerprint image", () => {
    const image = generateRidgeImage(192, 256, { frequency: 0.42, angle: 0.4, seed: 7 });
    const template = fingerprintService.createTemplate(image);
    expect(template.lbp.length).toBe(256);
    expect(template.hog.length).toBe(576);
    expect(template.patch.length).toBe(1024);
    expect(template.dhash).toHaveLength(16);
    expect(template.quality).toBeGreaterThan(0.2);
  });

  it("matches the same fingerprint with added noise", () => {
    const enrolled = generateRidgeImage(192, 256, {
      frequency: 0.4,
      angle: 0.35,
      phase: 0.2,
      seed: 11,
    });
    const probe = generateRidgeImage(192, 256, {
      frequency: 0.4,
      angle: 0.35,
      phase: 0.2,
      noise: 18,
      seed: 99,
    });
    const template = fingerprintService.createTemplate(enrolled);
    const result = fingerprintService.match(probe, template);
    expect(result.score).toBeGreaterThan(0.75);
  });

  it("rejects a different fingerprint pattern", () => {
    const enrolled = generateRidgeImage(192, 256, { frequency: 0.38, angle: 0.2, seed: 1 });
    const other = generateRidgeImage(192, 256, { frequency: 0.7, angle: 1.4, seed: 2 });
    const result = identifyTemplate(
      other,
      [{ studentId: "stu_1", template: fingerprintService.createTemplate(enrolled) }],
      0.58,
    );
    expect(result.matched).toBe(false);
    expect(result.studentId).toBeUndefined();
  });

  it("identifies the correct student among multiple templates", () => {
    const ali = generateRidgeImage(192, 256, { frequency: 0.41, angle: 0.3, seed: 3 });
    const sara = generateRidgeImage(192, 256, { frequency: 0.62, angle: 1.1, seed: 4 });
    const result = identifyTemplate(
      generateRidgeImage(192, 256, { frequency: 0.41, angle: 0.3, noise: 10, seed: 30 }),
      [
        { studentId: "ali", template: fingerprintService.createTemplate(ali) },
        { studentId: "sara", template: fingerprintService.createTemplate(sara) },
      ],
      0.58,
    );
    expect(result.matched).toBe(true);
    expect(result.studentId).toBe("ali");
  });

  it("does not invent a match for a blank image", () => {
    const blank = { data: new Uint8Array(192 * 256).fill(245), width: 192, height: 256 };
    expect(() => fingerprintService.enroll(blank)).toThrow(BiometricError);
  });
});
