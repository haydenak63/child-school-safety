import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError, errorResponse } from "@/lib/errors";
import { readJson } from "@/lib/http";

const schema = z.object({
  intent: z.enum(["contact", "demo"]).default("contact"),
  name: z.string().trim().min(1).max(120),
  organization: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(2000),
});

const inbox: Array<z.infer<typeof schema> & { receivedAt: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await readJson(request));
    inbox.push({ ...body, receivedAt: new Date().toISOString() });
    if (inbox.length > 50) inbox.shift();
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(new AppError("VALIDATION", "Please check the form and try again.", 400));
    }
    return errorResponse(error);
  }
}
