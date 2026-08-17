import Link from "next/link";
import {
  ClipboardIcon,
  GateIcon,
  ShieldIcon,
  UserPlusIcon,
  UsersIcon,
} from "@/components/dashboard/icons";

// Five fixed columns at every width. At 320px the content box is 288px, so each
// column is (288 - 4 gaps of 6px) / 5 ≈ 52px — enough for the 40px icon chip
// with the label truncating underneath, and never wide enough to overflow.
const actions = [
  { href: "/students/new", label: "Add", tint: "bg-tint-violet text-ink-violet", Icon: UserPlusIcon },
  { href: "/students", label: "Enroll", tint: "bg-tint-rose text-ink-rose", Icon: ShieldIcon },
  { href: "/attendance", label: "Attend", tint: "bg-tint-sky text-ink-sky", Icon: ClipboardIcon },
  { href: "/terminals", label: "Gates", tint: "bg-tint-amber text-ink-amber", Icon: GateIcon },
  { href: "/parents", label: "Parents", tint: "bg-tint-teal text-ink-teal", Icon: UsersIcon },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
      {actions.map(({ href, label, tint, Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface px-1 py-2 halo-shadow transition-transform duration-200 hover:-translate-y-0.5"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
            <Icon />
          </span>
          <span className="w-full truncate text-center text-[10px] font-semibold text-ink-soft sm:text-[11px]">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
