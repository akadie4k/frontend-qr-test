"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { errorMessage, listLinks, type LinkResponse, type PageResponse } from "@/lib/api";
import { formatDateTime, formatNumber, linkStatus, prettyUrl } from "@/lib/format";
import { CopyButton, DownloadQrButton, ShareButtons } from "./actions";
import { CatFace } from "./Cat";
import { DeactivateButton } from "./DeactivateButton";
import {
  AlertIcon,
  ChartIcon,
  ChevronLeft,
  ChevronRight,
  ClickIcon,
  ClockIcon,
  PlusIcon,
  QrIcon,
  RefreshIcon,
  SparkleIcon,
  XIcon,
} from "./icons";
import { QrCode } from "./QrCode";
import { StatusPill } from "./StatusPill";
import { btn, cardClass, containerClass, cx, dialogClass, qrTileClass, Skeleton } from "./ui";

const PAGE_SIZE = 10;

// one column template shared by the desktop header and rows
const COLS =
  "lg:grid-cols-[minmax(120px,0.9fr)_minmax(0,2fr)_76px_104px_150px_196px] lg:items-center lg:gap-4";

interface Loaded {
  key: string;
  /** when the data arrived — used for "expired" checks so render stays pure */
  at: number;
  /** last successful page (kept on error so the list doesn't vanish) */
  data?: PageResponse<LinkResponse>;
  error?: string;
}

/** Page numbers with gaps: 0-based in/out, -1 = gap */
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = [...new Set([0, total - 1, current - 1, current, current + 1])]
    .filter((p) => p >= 0 && p < total)
    .sort((a, b) => a - b);
  const out: number[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push(-1);
    out.push(p);
  });
  return out;
}

export function LinksList() {
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [qrLink, setQrLink] = useState<LinkResponse | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const key = `${page}:${reloadKey}`;

  useEffect(() => {
    let ignore = false;
    listLinks(page, PAGE_SIZE)
      .then((data) => {
        if (ignore) return;
        // if the current page became empty (e.g. after changes), step back
        if (data.content.length === 0 && page > 0 && data.totalPages > 0) {
          setPage(Math.min(page - 1, data.totalPages - 1));
          return;
        }
        setLoaded({ key, at: Date.now(), data });
      })
      .catch((err) => {
        if (!ignore) {
          setLoaded((prev) => ({ key, at: prev?.at ?? Date.now(), data: prev?.data, error: errorMessage(err) }));
        }
      });
    return () => {
      ignore = true;
    };
  }, [page, key]);

  const loading = !loaded || loaded.key !== key;
  const data = loaded?.data;
  const reload = () => setReloadKey((k) => k + 1);

  function goTo(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openQr(link: LinkResponse) {
    setQrLink(link);
    dialogRef.current?.showModal();
  }

  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div className={containerClass}>
      <div ref={topRef} className="flex flex-wrap items-end justify-between gap-4 pt-9 pb-5">
        <div>
          <h1 className="text-[clamp(1.7rem,5vw,2.4rem)] font-bold">ลิงก์ของฉัน</h1>
          <p className="mt-1 text-ink-soft" aria-live="polite">
            {data ? `ทั้งหมด ${formatNumber(data.totalElements)} ลิงก์` : "กำลังโหลดรายการลิงก์…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={btn("ghost")} onClick={reload} disabled={loading}>
            <RefreshIcon size={16} spin={loading} />
            รีเฟรช
          </button>
          <Link href="/" className={btn("primary")}>
            <PlusIcon size={16} />
            ย่อลิงก์ใหม่
          </Link>
        </div>
      </div>

      <div className={cx(cardClass, "p-2")} aria-busy={loading}>
        {loaded?.error && !data ? (
          <EmptyState mood="sad" title="ไม่สามารถโหลดรายการลิงก์ได้" body={loaded.error} alert>
            <button type="button" className={btn("primary")} onClick={reload}>
              <RefreshIcon size={16} />
              ลองอีกครั้ง
            </button>
          </EmptyState>
        ) : !data ? (
          <SkeletonRows />
        ) : data.content.length === 0 ? (
          <EmptyState mood="sleepy" title="ยังไม่มีลิงก์เลย" body="เริ่มต้นสร้างลิงก์สั้นลิงก์แรกของคุณได้ที่หน้าแรก">
            <Link href="/" className={btn("primary")}>
              <SparkleIcon size={16} />
              ย่อลิงก์แรก
            </Link>
          </EmptyState>
        ) : (
          <>
            {loaded?.error && (
              <div role="alert" className="m-2 flex items-start gap-2.5 rounded-2xl bg-danger-soft px-4 py-3 font-medium text-danger">
                <AlertIcon size={16} className="mt-1 shrink-0" />
                {loaded.error}
              </div>
            )}

            <div aria-hidden="true" className={`hidden px-4 pt-2.5 pb-1.5 text-[0.82rem] font-semibold text-muted lg:grid ${COLS}`}>
              <span>ลิงก์สั้น</span>
              <span>ลิงก์ต้นทาง</span>
              <span>คลิก</span>
              <span>สถานะ</span>
              <span>หมดอายุ</span>
              <span />
            </div>

            <ul
              className={`m-0 grid list-none gap-2 p-0 transition-opacity lg:gap-0 lg:divide-y lg:divide-dashed lg:divide-line ${loading ? "opacity-55" : ""}`}
            >
              {data.content.map((link) => (
                <LinkRow key={link.shortCode} link={link} now={loaded.at} onQr={openQr} onChanged={reload} />
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className="flex items-center justify-between gap-3 px-2 pt-[18px] pb-2" aria-label="เปลี่ยนหน้า">
                <button
                  type="button"
                  className={btn("ghost")}
                  onClick={() => goTo(page - 1)}
                  disabled={page <= 0 || loading}
                >
                  <ChevronLeft size={14} />
                  ก่อนหน้า
                </button>
                <span className="text-sm whitespace-nowrap text-muted sm:hidden">
                  หน้า {page + 1} / {totalPages}
                </span>
                <div className="hidden gap-1.5 sm:flex">
                  {pageWindow(page, totalPages).map((p, i) =>
                    p === -1 ? (
                      <span key={`gap-${i}`} className="grid min-w-6 place-items-center text-muted" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        aria-current={p === page ? "page" : undefined}
                        aria-label={`หน้า ${p + 1}`}
                        onClick={() => goTo(p)}
                        disabled={loading && p !== page}
                        className="size-11 cursor-pointer rounded-[14px] border-2 border-transparent font-semibold tabular-nums hover:border-line hover:bg-surface-2 aria-[current=page]:bg-orange aria-[current=page]:text-on-orange"
                      >
                        {p + 1}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  className={btn("ghost")}
                  onClick={() => goTo(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                >
                  ถัดไป
                  <ChevronRight size={14} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className={cx(dialogClass, "w-[min(100%-32px,380px)]")}
        aria-labelledby="qr-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        onClose={() => setQrLink(null)}
      >
        {qrLink && (
          <div className="grid justify-items-center gap-3.5 p-[22px]">
            <div className="flex w-full items-center justify-between gap-3">
              <h2 id="qr-dialog-title" className="truncate font-mono text-lg font-semibold">
                {prettyUrl(qrLink.shortUrl)}
              </h2>
              <button
                type="button"
                className={btn("ghost", { size: "icon" })}
                aria-label="ปิด"
                onClick={() => dialogRef.current?.close()}
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className={cx(qrTileClass, "max-w-[260px]")}>
              <QrCode value={qrLink.shortUrl} className="h-auto w-full rounded-lg" />
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <CopyButton text={qrLink.shortUrl} label="คัดลอกลิงก์" />
              <DownloadQrButton value={qrLink.shortUrl} filename={`nekoqr-${qrLink.shortCode}`} />
            </div>
            <ShareButtons url={qrLink.shortUrl} />
          </div>
        )}
      </dialog>
    </div>
  );
}

function LinkRow({
  link,
  now,
  onQr,
  onChanged,
}: {
  link: LinkResponse;
  now: number;
  onQr: (l: LinkResponse) => void;
  onChanged: () => void;
}) {
  const status = linkStatus(link, now);
  return (
    <li
      className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-2.5 rounded-3xl border-[1.5px] border-line bg-surface-2 p-4 [grid-template-areas:'short_status'_'orig_orig'_'stats_stats'_'acts_acts'] lg:rounded-2xl lg:border-0 lg:bg-transparent lg:px-4 lg:py-3 lg:transition-colors lg:[grid-template-areas:none] lg:hover:bg-surface-2 ${COLS}`}
    >
      <div className="min-w-0 [grid-area:short] lg:order-1 lg:[grid-area:auto]">
        <a
          className="block truncate font-mono font-semibold text-orange-text no-underline hover:underline hover:underline-offset-3"
          href={link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={link.shortUrl}
        >
          <span className="opacity-55">/</span>
          {link.shortCode}
        </a>
      </div>

      <div className="self-start [grid-area:status] lg:order-4 lg:self-center lg:[grid-area:auto]">
        <StatusPill status={status} />
      </div>

      <div className="min-w-0 [grid-area:orig] lg:order-2 lg:[grid-area:auto]">
        <a
          className="block truncate text-[0.92rem] text-ink-soft no-underline hover:text-ink hover:underline"
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={link.originalUrl}
        >
          {link.originalUrl}
        </a>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.88rem] text-muted [grid-area:stats] lg:contents">
        <span className="inline-flex items-center gap-1.5 lg:order-3">
          <ClickIcon size={13} className="lg:hidden" />
          <span className="font-bold text-ink tabular-nums">{formatNumber(link.clickCount)}</span>
          <span className="lg:sr-only">คลิก</span>
        </span>
        <span className="inline-flex items-center gap-1.5 lg:order-5 lg:text-[0.9rem]">
          <ClockIcon size={13} className="lg:hidden" />
          {link.expiresAt ? (
            <>
              <span className="lg:sr-only">หมดอายุ</span> {formatDateTime(link.expiresAt)}
            </>
          ) : (
            "ไม่มีวันหมดอายุ"
          )}
        </span>
        <span className="lg:hidden">สร้าง {formatDateTime(link.createdAt)}</span>
      </div>

      <div className="flex justify-end gap-2 [grid-area:acts] lg:order-6 lg:[grid-area:auto]">
        <CopyButton text={link.shortUrl} variant="icon" label="คัดลอกลิงก์" />
        <button
          type="button"
          className={btn("ghost", { size: "icon" })}
          onClick={() => onQr(link)}
          aria-label={`ดู QR code ของ ${prettyUrl(link.shortUrl)}`}
          title="QR code"
        >
          <QrIcon size={16} />
        </button>
        <Link
          href={`/links/${encodeURIComponent(link.shortCode)}`}
          className={btn("ghost", { size: "icon" })}
          aria-label={`ดูสถิติของ ${prettyUrl(link.shortUrl)}`}
          title="ดูสถิติ"
        >
          <ChartIcon size={16} />
        </Link>
        {link.active && (
          <DeactivateButton shortCode={link.shortCode} shortUrl={link.shortUrl} variant="icon" onDone={onChanged} />
        )}
      </div>
    </li>
  );
}

function EmptyState({
  mood,
  title,
  body,
  alert,
  children,
}: {
  mood: "sad" | "sleepy";
  title: string;
  body: string;
  alert?: boolean;
  children: ReactNode;
}) {
  return (
    <div role={alert ? "alert" : undefined} className="grid justify-items-center gap-2.5 px-5 pt-10 pb-11 text-center">
      <CatFace mood={mood} className="mb-1.5 w-[150px]" />
      <h2 className="text-[1.35rem] font-bold">{title}</h2>
      <p className="max-w-[420px] text-ink-soft">{body}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2.5">{children}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="grid gap-2 p-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="grid gap-2.5 p-2">
          <Skeleton className="h-[18px] w-2/5" />
          <Skeleton className="h-3.5 w-[85%]" />
        </div>
      ))}
    </div>
  );
}
