import { decryptString, encryptString } from "@/lib/crypto";
import type { Template } from "@/lib/biometric/types";

export function sealTemplate(template: Template): string {
  return encryptString(JSON.stringify(template));
}

export function openTemplate(sealed: string): Template {
  return JSON.parse(decryptString(sealed)) as Template;
}
