import { AppError } from "@/lib/errors";
import { recordDiagnostic } from "@/lib/biometric/diagnostics";
import { getBiometricProvider } from "@/lib/biometric/provider";
import { openTemplate, sealTemplate } from "@/lib/biometric/storage";
import { decodeDataUrl } from "@/lib/biometric/image";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/names";

export async function enrollFingerprintFromCapture(options: {
  studentId: string;
  image: string;
  finger?: string;
}) {
  const buffer = decodeDataUrl(options.image);
  const startedAt = Date.now();
  const template = await getBiometricProvider().enroll(buffer);
  const sealed = sealTemplate(template);

  await prisma.fingerprintTemplate.deleteMany({ where: { studentId: options.studentId } });
  await prisma.fingerprintTemplate.create({
    data: {
      studentId: options.studentId,
      templateData: sealed,
      finger: options.finger || "UNKNOWN",
    },
  });

  recordDiagnostic({
    action: "enroll",
    imageWidth: 192,
    imageHeight: 256,
    quality: template.quality,
    processingMs: Date.now() - startedAt,
    templateCreated: true,
    note: "Template stored. Raw image discarded.",
  });

  return {
    enrolled: true,
    quality: template.quality,
    processingMs: Date.now() - startedAt,
    diagnostics: isDemoMode()
      ? { imageWidth: 192, imageHeight: 256, quality: template.quality, templateCreated: true }
      : undefined,
  };
}

export async function identifyFingerprint(options: {
  schoolId: string;
  image: string;
  threshold: number;
}) {
  const buffer = decodeDataUrl(options.image);
  const rows = await prisma.fingerprintTemplate.findMany({
    where: { student: { schoolId: options.schoolId, status: "ACTIVE" } },
    include: { student: true },
  });

  const gallery = rows.map((row) => ({
    studentId: row.studentId,
    template: openTemplate(row.templateData),
  }));

  const startedAt = Date.now();
  const result = await getBiometricProvider().identify(buffer, gallery, options.threshold);

  recordDiagnostic({
    action: "identify",
    imageWidth: result.diagnostics.imageWidth,
    imageHeight: result.diagnostics.imageHeight,
    quality: result.quality,
    confidence: result.confidence,
    matched: result.matched,
    processingMs: Date.now() - startedAt,
  });

  if (!result.matched || !result.studentId) {
    throw new AppError(
      "NO_MATCH",
      "No student matched. Please reposition your finger and try again.",
      404,
      isDemoMode()
        ? {
            confidence: result.confidence,
            quality: result.quality,
            processingMs: result.diagnostics.processingMs,
          }
        : undefined,
    );
  }

  const student = rows.find((row) => row.studentId === result.studentId)?.student;
  if (!student) {
    throw new AppError("NO_MATCH", "No student matched. Please reposition your finger and try again.", 404);
  }

  return {
    student: {
      id: student.id,
      name: fullName(student),
      className: student.className,
      section: student.section,
    },
    confidence: result.confidence,
    quality: result.quality,
    diagnostics: isDemoMode() ? result.diagnostics : undefined,
  };
}
