export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    code?: string;
    details?: Record<string, unknown>;
  };

  if (!response.ok) {
    const error = new Error(data.error || "Request failed") as Error & {
      code?: string;
      details?: Record<string, unknown>;
      status?: number;
    };
    error.code = data.code;
    error.details = data.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
