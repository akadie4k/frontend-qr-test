import type { LinkStatus } from "@/lib/format";

const STYLES: Record<LinkStatus, { label: string; cls: string }> = {
  active: { label: "ใช้งานได้", cls: "bg-success-soft text-success" },
  expired: { label: "หมดอายุ", cls: "bg-muted-soft text-muted" },
  disabled: { label: "ปิดใช้งาน", cls: "bg-danger-soft text-danger" },
};

export function StatusPill({ status }: { status: LinkStatus }) {
  const { label, cls } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className="size-[7px] rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
