"use client";

import { useRef, useState } from "react";
import { qrSvgString } from "./QrCode";
import { CheckIcon, CopyIcon, DownloadIcon, FacebookIcon, LineIcon, ShareIcon, XBrandIcon } from "./icons";
import { btn } from "./ui";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for http:// or older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

interface CopyButtonProps {
  text: string;
  variant?: "primary" | "ghost" | "icon";
  label?: string;
}

export function CopyButton({ text, variant = "ghost", label = "คัดลอก" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function onCopy() {
    const ok = await writeClipboard(text);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  const Icon = copied ? CheckIcon : CopyIcon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={btn("ghost", { size: "icon", done: copied })}
        onClick={onCopy}
        aria-label={copied ? "คัดลอกแล้ว" : `${label} ${text}`}
        title={copied ? "คัดลอกแล้ว" : label}
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={btn(variant === "primary" ? "primary" : "ghost", { done: copied })}
      onClick={onCopy}
    >
      <Icon size={18} />
      <span aria-live="polite">{copied ? "คัดลอกแล้ว!" : label}</span>
    </button>
  );
}

export function DownloadQrButton({ value, filename }: { value: string; filename: string }) {
  const [busy, setBusy] = useState(false);

  function onDownload() {
    setBusy(true);
    const svg = qrSvgString(value, 1024);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setBusy(false);
        return;
      }
      ctx.drawImage(img, 0, 0, 1024, 1024);
      canvas.toBlob((blob) => {
        setBusy(false);
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, "image/png");
    };
    img.onerror = () => setBusy(false);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  return (
    <button type="button" className={btn("ghost")} onClick={onDownload} disabled={busy}>
      <DownloadIcon size={18} />
      <span>{busy ? "กำลังเตรียม…" : "โหลด QR (PNG)"}</span>
    </button>
  );
}

/** LINE / Facebook / X share links + the native share sheet on phones. */
export function ShareButtons({ url, text = "ลิงก์จาก NekoQR" }: { url: string; text?: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const targets = [
    {
      name: "LINE",
      href: `https://social-plugins.line.me/lineit/share?url=${u}`,
      Icon: LineIcon,
      cls: "hover:border-[#06C755] hover:text-[#06C755]",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      Icon: FacebookIcon,
      cls: "hover:border-[#1877F2] hover:text-[#1877F2]",
    },
    {
      name: "X",
      href: `https://x.com/intent/post?url=${u}&text=${t}`,
      Icon: XBrandIcon,
      cls: "hover:border-ink",
    },
  ];

  async function nativeShare() {
    try {
      await navigator.share({ url, title: "NekoQR", text });
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">แชร์ไปที่</span>
      {targets.map(({ name, href, Icon, cls }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={btn("ghost", { size: "icon", className: cls })}
          aria-label={`แชร์ไป ${name}`}
          title={name}
        >
          <Icon size={18} />
        </a>
      ))}
      <button
        type="button"
        className={btn("ghost", { size: "icon", className: "sm:hidden" })}
        onClick={nativeShare}
        aria-label="แชร์ด้วยแอปอื่น"
        title="แชร์"
      >
        <ShareIcon size={18} />
      </button>
    </div>
  );
}
