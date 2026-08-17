import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "@/components/brand/logo-mark";

export function Logo({ className = "text-ink" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label={site.name}>
      <span className="marketing-mark flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
        <LogoMark className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-current">{site.name}</span>
    </Link>
  );
}
