"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkIcon, ListIcon } from "./icons";

const ITEMS = [
  { href: "/", long: "ย่อลิงก์", short: "ย่อ", Icon: LinkIcon, match: (p: string) => p === "/" },
  {
    href: "/links",
    long: "ลิงก์ของฉัน",
    short: "ลิงก์",
    Icon: ListIcon,
    match: (p: string) => p.startsWith("/links"),
  },
];

function Items({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-sm"
    >
      {ITEMS.map(({ href, long, short, Icon, match }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname && match(pathname) ? "page" : undefined}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[0.95rem] font-semibold text-ink-soft no-underline transition-colors hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-orange aria-[current=page]:text-on-orange min-[421px]:px-3.5"
        >
          <Icon size={16} />
          <span className="hidden min-[421px]:inline">{long}</span>
          <span className="min-[421px]:hidden">{short}</span>
        </Link>
      ))}
    </nav>
  );
}

function WithPathname() {
  return <Items pathname={usePathname()} />;
}

/** pass `pathname={null}` for the static (Suspense fallback) version */
export function NavLinks(props: { pathname?: string | null }) {
  if ("pathname" in props) return <Items pathname={props.pathname ?? null} />;
  return <WithPathname />;
}
