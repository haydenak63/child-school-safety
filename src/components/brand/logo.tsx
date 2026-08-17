import Link from "next/link";

export function Logo({ className = "text-ink" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/90" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-current">Halo</span>
    </Link>
  );
}
