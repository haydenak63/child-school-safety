import type { Metadata } from "next";
import { FaqList } from "@/components/marketing/faq-list";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Halo enrollment, terminals, attendance, and the biometric prototype.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow">FAQ</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Questions schools ask first.</h1>
      <div className="mt-10">
        <FaqList />
      </div>
    </div>
  );
}
