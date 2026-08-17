import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Book a demo",
  description: "Request a walkthrough of Halo school attendance.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div>
        <p className="eyebrow">Demo</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">See the full arrival and departure loop.</h1>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          We’ll walk through student enrollment, the mobile capture flow, the gate terminal, and the
          parent notification log.
        </p>
      </div>
      <ContactForm intent="demo" />
    </div>
  );
}
