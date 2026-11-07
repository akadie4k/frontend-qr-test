"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ApiError, errorMessage, getLink, type LinkResponse } from "@/lib/api";
import { formatDateTime, formatNumber, linkStatus, prettyUrl } from "@/lib/format";
import { CopyButton, DownloadQrButton, ShareButtons } from "./actions";
import { CatFace } from "./Cat";
import { DeactivateButton } from "./DeactivateButton";
import { ClickIcon, ClockIcon, ExternalIcon, RefreshIcon, SparkleIcon } from "./icons";
import { QrCode } from "./QrCode";
import { StatusPill } from "./StatusPill";
import { btn, cardClass, cx, qrTileClass, shortBoxClass, shortUrlClass, Skeleton } from "./ui";

type State =
  | { key: string; at: number; link: LinkResponse }
  | { key: string; at: number; notFound: true }
  | { key: string; at: number; error: string };

function StateCard({ title, body, alert, children }: { title: string; body: ReactNode; alert?: boolean; children: ReactNode }) {
  return (
    <div role={alert ? "alert" : undefined} className={cx(cardClass, "mt-2 grid justify-items-center gap-2.5 px-5 pt-10 pb-11 text-center")}>
      <CatFace mood="sad" className="mb-1.5 w-[150px]" />
      <h1 className="text-[1.45rem] font-bold">{title}</h1>
      <p className="max-w-[420px] text-ink-soft">{body}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2.5">{children}</div>
    </div>
  );
}

export function LinkDetail({ shortCode }: { shortCode: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<State | null>(null);
  const key = `${shortCode}:${reloadKey}`;
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let ignore = false;
    getLink(shortCode)
      .then((link) => {
        if (!ignore) setState({ key, at: Date.now(), link });
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.status === 404) setState({ key, at: Date.now(), notFound: true });
        else setState({ key, at: Date.now(), error: errorMessage(err) });
      });
    return () => {
      ignore = true;
    };
  }, [shortCode, key]);

  // keep showing the previous data during a refresh
  if (!state || (state.key !== key && !("link" in state))) return <LinkDetailSkeleton />;

  if ("notFound" in state) {
    return (
      <StateCard
        title="ไม่พบลิงก์นี้"
        body={
          <>
            ไม่พบลิงก์ <span className="font-mono">{shortCode}</span> ในระบบ ลิงก์อาจไม่ถูกต้องหรือถูกลบไปแล้ว
          </>
        }
      >
        <Link href="/links" className={btn("ghost")}>
          ดูลิงก์ทั้งหมด
        </Link>
        <Link href="/" className={btn("primary")}>
          <SparkleIcon size={16} />
          ย่อลิงก์ใหม่
        </Link>
      </StateCard>
    );
  }

  if ("error" in state) {
    return (
      <StateCard title="ไม่สามารถโหลดข้อมูลได้" body={state.error} alert>
        <button type="button" className={btn("primary")} onClick={reload}>
          <RefreshIcon size={16} />
          ลองอีกครั้ง
        </button>
      </StateCard>
    );
  }

  const { link, at } = state;
  const refreshing = state.key !== key;
  const status = linkStatus(link, at);

  return (
    <div className="mt-2 grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
      <section className={cx(cardClass, "grid justify-items-center gap-3.5 p-[22px]")} aria-label="QR code">
        <div className={cx(qrTileClass, "max-w-[276px]")}>
          <QrCode value={link.shortUrl} className="h-auto w-full rounded-lg" />
        </div>
        <p className="text-center text-sm text-muted">สแกนแล้วพาไปที่ลิงก์ต้นทางทันที</p>
        <DownloadQrButton value={link.shortUrl} filename={`nekoqr-${link.shortCode}`} />
      </section>

      <section className={cx(cardClass, "p-[22px] transition-opacity sm:p-7", refreshing && "opacity-60")}>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
          <h1 className="font-mono text-[clamp(1.5rem,4.5vw,2rem)] font-bold break-all">{link.shortCode}</h1>
          <StatusPill status={status} />
        </div>

        <div className={cx(shortBoxClass, "mt-3")}>
          <a
            className={shortUrlClass}
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {prettyUrl(link.shortUrl)}
          </a>
          <CopyButton text={link.shortUrl} variant="primary" label="คัดลอกลิงก์" />
        </div>

        <dl className="mt-[22px] grid grid-cols-2 gap-3 xl:grid-cols-3">
          <Stat className="col-span-2 xl:col-span-1" label="คลิกทั้งหมด" icon={<ClickIcon size={13} />}>
            <span className="font-display text-3xl leading-tight tabular-nums">{formatNumber(link.clickCount)}</span>
          </Stat>
          <Stat label="สร้างเมื่อ">{formatDateTime(link.createdAt)}</Stat>
          <Stat label="หมดอายุ" icon={<ClockIcon size={13} />}>
            {link.expiresAt ? formatDateTime(link.expiresAt) : "ไม่หมดอายุ"}
          </Stat>
        </dl>

        <dl className="mt-[18px] grid gap-0.5 min-[520px]:grid-cols-[110px_1fr] min-[520px]:gap-3">
          <dt className="text-sm text-muted">ลิงก์ต้นทาง</dt>
          <dd className="m-0 min-w-0">
            <a
              className="break-all text-ink underline-offset-3"
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.originalUrl}
              <ExternalIcon size={12} className="ml-1.5 inline-block align-[-1px]" />
            </a>
          </dd>
        </dl>

        <div className="mt-5">
          <ShareButtons url={link.shortUrl} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" className={btn("ghost")} onClick={reload} disabled={refreshing}>
            <RefreshIcon size={16} spin={refreshing} />
            อัปเดตยอดคลิก
          </button>
          {link.active && (
            <DeactivateButton shortCode={link.shortCode} shortUrl={link.shortUrl} onDone={reload} />
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  icon,
  className = "",
  children,
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`min-w-0 rounded-2xl border-[1.5px] border-line bg-surface-2 px-4 py-3.5 ${className}`}>
      <dt className="flex items-center gap-1.5 text-sm text-muted">
        {icon}
        {label}
      </dt>
      <dd className="m-0 mt-1 font-semibold break-words">{children}</dd>
    </div>
  );
}

export function LinkDetailSkeleton() {
  return (
    <div className="mt-2 grid gap-5 lg:grid-cols-[320px_1fr]" aria-busy="true" aria-label="กำลังโหลด">
      <div className={cx(cardClass, "grid justify-items-center p-[22px]")}>
        <Skeleton className="aspect-square w-[min(100%,252px)] rounded-3xl" />
      </div>
      <div className={cx(cardClass, "grid gap-[18px] p-[22px]")}>
        <Skeleton className="h-8 w-[45%]" />
        <Skeleton className="h-16" />
        <Skeleton className="h-[120px]" />
      </div>
    </div>
  );
}
