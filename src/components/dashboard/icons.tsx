// Small inline icon set for the dashboard. Inline rather than a dependency:
// there are only a handful, they inherit currentColor, and they render on the
// server with no client bundle cost.
type IconProps = { className?: string };

function Svg({ className = "", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-[18px] w-[18px] ${className}`}
    >
      {children}
    </svg>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M18 8.5v5M20.5 11h-5" />
    </Svg>
  );
}

export function FingerprintIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.5c-3 0-5.5 2.4-5.5 5.4 0 1.2.2 2.3.2 2.3" />
      <path d="M12 4.5c3 0 5.5 2.4 5.5 5.4 0 3.5-.8 6.3-1.5 8.1" />
      <path d="M9 20c.9-1.7 1.6-4 1.6-7 0-1 .6-1.8 1.4-1.8s1.4.8 1.4 1.8c0 2.4-.4 4.4-.9 5.9" />
      <path d="M6.2 17.6c.6-1.3 1-3 1-5.1 0-2.5 2.1-4.6 4.8-4.6s4.8 2.1 4.8 4.6" />
    </Svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4.5h6v2H9zM7 5.5H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 18 5.5h-1" />
      <path d="M8.5 11h7M8.5 14.5h4.5" />
    </Svg>
  );
}

export function GateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.8" />
      <path d="M8 20h8M12 16.5V20" />
      <path d="M8.5 9l2 2-2 2M13 13h3" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-3A3.5 3.5 0 0 0 3 18.5V20" />
      <circle cx="8" cy="8" r="3.2" />
      <path d="M16 15.2a3.5 3.5 0 0 1 5 3.3V20M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
    </Svg>
  );
}

export function ArrowInIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v10" />
      <path d="M8 11.5l4 4 4-4" />
      <path d="M5 19h14" />
    </Svg>
  );
}

export function ArrowOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19V9" />
      <path d="M8 12.5l4-4 4 4" />
      <path d="M5 5h14" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 17.5h15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5l7 2.5v5.5c0 4-2.9 7.4-7 8.5-4.1-1.1-7-4.5-7-8.5V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </Svg>
  );
}

export function TrendUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 16.5l5-5 3 3 5.5-5.5" />
      <path d="M14 8.5h4.5V13" />
    </Svg>
  );
}
