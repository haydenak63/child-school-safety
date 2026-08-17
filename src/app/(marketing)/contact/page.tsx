import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk with Halo about school attendance and child-safety operations.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Let’s make school arrivals safer.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-ink-muted">
          Tell us about your school. This form is part of the prototype and does not send mail to a
          public company address.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
