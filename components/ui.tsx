/**
 * Shared Tailwind class recipes + tiny UI components.
 * Use the class helpers on <Link>/<a>, or the components directly.
 */
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------- button ---------- */

export type ButtonVariant = "primary" | "ghost" | "quiet" | "danger" | "solid-danger";

interface BtnOptions {
  size?: "md" | "lg" | "icon";
  /** green "copied!" state */
  done?: boolean;
  className?: string;
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 font-semibold leading-tight no-underline select-none cursor-pointer transition duration-150 ease-out focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-orange text-on-orange shadow-press hover:not-disabled:-translate-y-px hover:not-disabled:bg-orange-strong hover:not-disabled:shadow-press-hover active:not-disabled:translate-y-[3px] active:not-disabled:shadow-press-active",
  ghost:
    "border-line bg-surface text-ink hover:not-disabled:border-line-strong hover:not-disabled:bg-surface-2 active:not-disabled:scale-[0.97]",
  quiet: "border-transparent bg-transparent text-ink-soft hover:not-disabled:bg-surface-2 hover:not-disabled:text-ink",
  danger: "border-danger/40 bg-surface text-danger hover:not-disabled:bg-danger-soft",
  "solid-danger": "border-danger bg-danger text-white hover:not-disabled:opacity-90 dark:text-on-orange",
};

const BTN_SIZE = {
  md: "min-h-[46px] px-5 text-[0.98rem]",
  lg: "min-h-14 px-6 text-[1.05rem]",
  icon: "size-11 shrink-0 p-0",
};

const BTN_DONE: Partial<Record<ButtonVariant, string>> = {
  primary: "bg-success-soft! text-success! shadow-[0_4px_0_var(--c-success)]!",
  ghost: "border-success! text-success!",
};

export function btn(variant: ButtonVariant = "ghost", { size = "md", done, className }: BtnOptions = {}) {
  return cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], done && (BTN_DONE[variant] ?? BTN_DONE.ghost), className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BtnOptions {
  variant?: ButtonVariant;
}

export function Button({ variant = "ghost", size, done, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={btn(variant, { size, done, className })} {...rest} />;
}

/* ---------- surfaces ---------- */

export const cardClass = "relative rounded-4xl border-2 border-line bg-surface shadow-soft";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(cardClass, className)} {...rest} />;
}

export const containerClass = "mx-auto w-[min(100%-32px,1120px)]";

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(containerClass, className)} {...rest} />;
}

/* ---------- form ---------- */

export function inputClass({ large = false, withIcon = false, className = "" } = {}) {
  return cx(
    "w-full rounded-2xl border-2 border-line bg-surface-2 text-ink transition placeholder:text-muted/75 hover:border-line-strong focus:border-orange focus:bg-surface focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--c-orange)_28%,transparent)] focus:outline-none aria-invalid:border-danger",
    large ? "min-h-[60px] text-[1.05rem]" : "min-h-14 text-base",
    withIcon ? "pr-4 pl-12" : "px-4",
    className,
  );
}

/* ---------- feedback ---------- */

export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="alert" className={cx("flex items-start gap-2.5 rounded-2xl bg-danger-soft px-4 py-3.5 font-medium text-danger", className)}>
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "animate-shimmer rounded-[10px] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--c-muted-soft)_0%,color-mix(in_srgb,var(--c-muted-soft)_40%,var(--c-surface))_50%,var(--c-muted-soft)_100%)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Classes for a native <dialog> (incl. its backdrop). */
export const dialogClass =
  "m-auto rounded-4xl border-2 border-line bg-surface p-0 text-ink shadow-2xl open:animate-pop-in backdrop:bg-[rgb(42_22_11/0.45)] backdrop:backdrop-blur-[3px]";

/** QR code tile (white so codes always scan, even in dark mode). */
export const qrTileClass = "w-full rounded-3xl border-2 border-dashed border-line-strong bg-white p-3";

/** The orange box that holds the short URL + copy button. */
export const shortBoxClass =
  "grid gap-3 rounded-3xl border-2 border-orange/55 bg-orange-tint p-3.5 min-[520px]:grid-cols-[1fr_auto] min-[520px]:items-center min-[520px]:py-2.5 min-[520px]:pr-2.5 min-[520px]:pl-[18px]";

export const shortUrlClass =
  "min-w-0 font-mono text-[clamp(1.05rem,3.6vw,1.3rem)] leading-snug font-semibold break-all no-underline hover:underline hover:underline-offset-4";
