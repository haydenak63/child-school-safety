import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-3xl font-semibold">This page isn’t here.</h1>
      <p className="mt-3 max-w-md text-sm text-ink-muted">
        The link may be expired, revoked, or typed incorrectly.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/">Back to Halo</Button>
        <Button href="/login" variant="secondary">
          Sign in
        </Button>
      </div>
    </div>
  );
}
