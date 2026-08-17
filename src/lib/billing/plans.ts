import type { BillingPlan } from "@prisma/client";

export type PlanCatalogItem = {
  id: BillingPlan;
  name: string;
  tagline: string;
  monthlyPkr: number;
  popular?: boolean;
  studentLimit: number | null;
  terminalLimit: number | null;
  features: string[];
};

export const PLANS: PlanCatalogItem[] = [
  {
    id: "STARTER",
    name: "Starter",
    tagline: "One campus, the essentials.",
    monthlyPkr: 4900,
    studentLimit: 100,
    terminalLimit: 2,
    features: [
      "Up to 100 students",
      "2 gate terminals",
      "Parent WhatsApp alerts",
      "Attendance history",
      "Email support",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    tagline: "For schools that run more than one gate.",
    monthlyPkr: 12900,
    popular: true,
    studentLimit: 400,
    terminalLimit: 6,
    features: [
      "Up to 400 students",
      "6 gate terminals",
      "Parent WhatsApp alerts",
      "IQ Pigeon integration",
      "Priority email support",
    ],
  },
  {
    id: "CAMPUS",
    name: "Campus",
    tagline: "Multiple buildings, no student cap.",
    monthlyPkr: 29900,
    studentLimit: null,
    terminalLimit: null,
    features: [
      "Unlimited students",
      "Unlimited terminals",
      "Parent WhatsApp alerts",
      "IQ Pigeon integration",
      "Named account contact",
    ],
  },
];

export function planById(id: BillingPlan): PlanCatalogItem {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown plan ${id}`);
  return plan;
}

export function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}
