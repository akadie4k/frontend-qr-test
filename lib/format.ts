import type { LinkResponse } from "./api";

export type LinkStatus = "active" | "expired" | "disabled";

/** `now` is passed in so render stays pure (capture it when data arrives). */
export function linkStatus(link: LinkResponse, now: number): LinkStatus {
  if (!link.active) return "disabled";
  if (link.expiresAt && Date.parse(link.expiresAt) <= now) return "expired";
  return "active";
}

const dateTimeFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const numberFmt = new Intl.NumberFormat("th-TH");

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "—" : dateTimeFmt.format(t);
}

export function formatNumber(n: number): string {
  return numberFmt.format(n);
}

/** "https://nekoqr.app/abc" → "nekoqr.app/abc" for display */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/**
 * Normalises user input into an absolute http(s) URL.
 * Returns null when it can't be a valid web link.
 */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname;
    if (!host.includes(".") && host !== "localhost") return null;
    const out = u.toString();
    return out.length > URL_MAX ? null : out;
  } catch {
    return null;
  }
}

// Same rules as the backend's CreateLinkRequest validation
export const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,16}$/;
export const ALIAS_MAX = 16;
export const URL_MAX = 2048;

/** Date → "2026-11-08T21:30:00" (local time, no zone) for Spring LocalDateTime */
export function toLocalDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
