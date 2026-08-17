import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export function AuthFrame({
  children,
  eyebrow = "School attendance",
  panelTitle = (
    <>
      Every arrival.
      <br />
      Every departure.
      <br />
      Accounted for.
    </>
  ),
  panelBody = "Sign in to manage students, enrollment, terminals, and parent notifications.",
}: {
  children: ReactNode;
  eyebrow?: string;
  panelTitle?: ReactNode;
  panelBody?: string;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-brand px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
          <Logo className="text-white" />
          <div className="max-w-md">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">{panelTitle}</h1>
            <p className="mt-4 text-sm leading-6 text-white/70">{panelBody}</p>
          </div>
          <p className="text-xs text-white/50">Secure attendance and child safety for schools.</p>
        </section>
        <section className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-[24px] border border-line bg-surface p-6 halo-shadow sm:p-8">
            <div className="lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
