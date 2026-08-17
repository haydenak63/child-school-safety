export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "EMAIL_UNVERIFIED"
  | "BILLING_DISABLED"
  | "RATE_LIMITED"
  | "ENROLLMENT_EXPIRED"
  | "ENROLLMENT_USED"
  | "TERMINAL_UNAUTHORIZED"
  | "QUALITY_POOR"
  | "NO_FINGERPRINT"
  | "NO_MATCH"
  | "COOLDOWN"
  | "NETWORK"
  | "SERVER";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    );
  }

  console.error("Unexpected error", error instanceof Error ? error.message : "unknown");
  return Response.json(
    {
      error: "Server unavailable. Please try again.",
      code: "SERVER",
    },
    { status: 500 },
  );
}

export function publicErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AppError) return error.message;
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  if (code === "P2021" || code === "P2022") {
    return "This feature is not ready on the server yet. Ask the operator to run database migrations.";
  }
  return fallback;
}
