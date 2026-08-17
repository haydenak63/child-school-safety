import { AppError } from "@/lib/errors";

export class BiometricError extends AppError {
  constructor(
    code: "QUALITY_POOR" | "NO_FINGERPRINT" | "NO_MATCH",
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(code, message, 422, details);
    this.name = "BiometricError";
  }
}
