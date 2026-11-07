"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ApiError, createLink, errorMessage, type LinkResponse } from "@/lib/api";
import {
  ALIAS_MAX,
  ALIAS_PATTERN,
  formatDateTime,
  normalizeUrl,
  prettyUrl,
  toLocalDateTime,
} from "@/lib/format";
import { CopyButton, DownloadQrButton, ShareButtons } from "./actions";
import { CatFace, type CatMood } from "./Cat";
import {
  AlertIcon,
  ChartIcon,
  ChevronDown,
  ExternalIcon,
  LinkIcon,
  PlusIcon,
  SparkleIcon,
} from "./icons";
import { QrCode } from "./QrCode";
import { btn, cardClass, cx, inputClass, qrTileClass, shortBoxClass, shortUrlClass } from "./ui";

type Expiry = "never" | "1d" | "7d" | "30d" | "custom";

const EXPIRY_OPTIONS: { value: Expiry; label: string }[] = [
  { value: "never", label: "ไม่หมดอายุ" },
  { value: "1d", label: "1 วัน" },
  { value: "7d", label: "7 วัน" },
  { value: "30d", label: "30 วัน" },
  { value: "custom", label: "กำหนดเอง" },
];

const DAY = 24 * 60 * 60 * 1000;
const BAD_URL = "รูปแบบลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (ตัวอย่าง: https://example.com)";

interface Errors {
  url?: string;
  alias?: string;
  expiry?: string;
}

function resolveExpiry(preset: Expiry, custom: string): { value?: string; error?: string } {
  const now = Date.now();
  const days = { "1d": 1, "7d": 7, "30d": 30 } as const;
  if (preset === "never") return {};
  if (preset !== "custom") return { value: toLocalDateTime(new Date(now + days[preset] * DAY)) };
  if (!custom) return { error: "กรุณาเลือกวันและเวลาหมดอายุ" };
  const d = new Date(custom); // datetime-local is already local time
  if (Number.isNaN(d.getTime())) return { error: "รูปแบบวันที่ไม่ถูกต้อง" };
  if (d.getTime() <= now) return { error: "วันหมดอายุต้องเป็นเวลาในอนาคต" };
  return { value: toLocalDateTime(d) };
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <AlertIcon size={14} className="mt-1 shrink-0" />
      {children}
    </p>
  );
}

export function ShortenPanel() {
  const ids = useId();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [expiry, setExpiry] = useState<Expiry>("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LinkResponse | null>(null);

  const urlRef = useRef<HTMLInputElement>(null);
  const aliasRef = useRef<HTMLInputElement>(null);
  const customRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  const hasErrors = Boolean(serverError || errors.url || errors.alias || errors.expiry);
  const mood: CatMood = result ? "happy" : hasErrors ? "sad" : url.trim() ? "curious" : "idle";

  function focusFirst(next: Errors) {
    if (next.url) urlRef.current?.focus();
    else if (next.alias) {
      setShowMore(true);
      requestAnimationFrame(() => aliasRef.current?.focus());
    } else if (next.expiry) {
      setShowMore(true);
      requestAnimationFrame(() => customRef.current?.focus());
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);

    const next: Errors = {};
    const normalized = normalizeUrl(url);
    if (!url.trim()) next.url = "กรุณาระบุลิงก์ที่ต้องการย่อ";
    else if (!normalized) next.url = BAD_URL;
    const a = alias.trim();
    if (a && !ALIAS_PATTERN.test(a)) next.alias = "ชื่อลิงก์ต้องมี 3–16 ตัวอักษร และใช้ได้เฉพาะ a–z, A–Z, 0–9, - และ _";
    const exp = resolveExpiry(expiry, customExpiry);
    if (exp.error) next.expiry = exp.error;

    setErrors(next);
    if (!normalized || next.alias || next.expiry) {
      focusFirst(next);
      return;
    }

    setSubmitting(true);
    createLink({
      originalUrl: normalized,
      ...(a ? { customAlias: a } : {}),
      ...(exp.value ? { expiresAt: exp.value } : {}),
    })
      .then((res) => {
        setResult(res);
        setUrl("");
        setAlias("");
        setExpiry("never");
        setCustomExpiry("");
        setShowMore(false);
      })
      .catch((err) => {
        // Map backend fieldErrors back onto the inputs
        if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
          const fe = err.fieldErrors;
          const mapped: Errors = {
            url: fe.originalUrl,
            alias: fe.customAlias,
            expiry: fe.expiresAt,
          };
          setErrors(mapped);
          focusFirst(mapped);
          if (!mapped.url && !mapped.alias && !mapped.expiry) setServerError(err.message);
        } else if (err instanceof ApiError && err.status === 409) {
          const mapped = { alias: err.message };
          setErrors(mapped);
          focusFirst(mapped);
        } else {
          setServerError(errorMessage(err));
        }
      })
      .finally(() => setSubmitting(false));
  }

  function reset() {
    setResult(null);
    setErrors({});
    setServerError(null);
    requestAnimationFrame(() => urlRef.current?.focus());
  }

  const urlErrId = `${ids}-url-err`;
  const aliasErrId = `${ids}-alias-err`;
  const aliasHintId = `${ids}-alias-hint`;
  const expiryErrId = `${ids}-exp-err`;

  return (
    <div className="relative mx-auto mt-24 max-w-[880px] sm:mt-28">
      <div className="pointer-events-none absolute right-7 bottom-[calc(100%-28px)] z-10 w-32 sm:right-12 sm:w-[150px]">
        <CatFace
          mood={mood}
          paws
          className={`transition-transform duration-400 ease-spring ${mood === "curious" ? "-translate-y-1.5 -rotate-3" : ""}`}
        />
      </div>

      <div className={cx(cardClass, "px-[18px] pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-7")}>
        {result ? (
          <div className="grid animate-pop-in gap-6 md:grid-cols-[1fr_230px] md:items-start">
            <div className="min-w-0">
              <h2
                ref={resultHeadingRef}
                tabIndex={-1}
                className="text-2xl font-bold focus:outline-none"
              >
                สร้างลิงก์สั้นเรียบร้อยแล้ว
              </h2>
              <p className="mt-1 text-ink-soft">คัดลอกลิงก์หรือสแกน QR code เพื่อใช้งานได้ทันที</p>

              <div className={cx(shortBoxClass, "mt-4")}>
                <a
                  className={shortUrlClass}
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {prettyUrl(result.shortUrl)}
                </a>
                <CopyButton text={result.shortUrl} variant="primary" label="คัดลอกลิงก์" />
              </div>

              <dl className="mt-4 grid gap-2.5">
                <div className="grid gap-0.5 min-[520px]:grid-cols-[110px_1fr] min-[520px]:gap-3">
                  <dt className="text-sm text-muted">ลิงก์ต้นทาง</dt>
                  <dd className="line-clamp-2 min-w-0 break-all" title={result.originalUrl}>
                    {result.originalUrl}
                  </dd>
                </div>
                <div className="grid gap-0.5 min-[520px]:grid-cols-[110px_1fr] min-[520px]:gap-3">
                  <dt className="text-sm text-muted">หมดอายุ</dt>
                  <dd>{result.expiresAt ? formatDateTime(result.expiresAt) : "ไม่มีวันหมดอายุ"}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <ShareButtons url={result.shortUrl} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <a className={btn("ghost")} href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalIcon size={16} />
                  เปิดลิงก์
                </a>
                <Link className={btn("ghost")} href={`/links/${encodeURIComponent(result.shortCode)}`}>
                  <ChartIcon size={16} />
                  ดูสถิติ
                </Link>
                <button type="button" className={btn("quiet")} onClick={reset}>
                  <PlusIcon size={16} />
                  ย่อลิงก์ใหม่
                </button>
              </div>
            </div>

            <div className="grid justify-items-center gap-3">
              <div className={cx(qrTileClass, "max-w-[240px]")}>
                <QrCode value={result.shortUrl} className="h-auto w-full rounded-lg" />
              </div>
              <DownloadQrButton value={result.shortUrl} filename={`nekoqr-${result.shortCode}`} />
            </div>
          </div>
        ) : (
          <form className="grid gap-[18px]" onSubmit={onSubmit} noValidate>
            <div className="grid gap-2">
              <label className="text-[0.95rem] font-semibold" htmlFor={`${ids}-url`}>
                ลิงก์ที่อยากย่อ
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="grid gap-2">
                <div className="relative flex items-center">
                  <LinkIcon size={18} className="pointer-events-none absolute left-4 text-muted" />
                  <input
                    ref={urlRef}
                    id={`${ids}-url`}
                    className={inputClass({ large: true, withIcon: true })}
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={2048}
                    placeholder="https://ลิงก์ยาวๆ-ของคุณ.com/…"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) setErrors((p) => ({ ...p, url: undefined }));
                    }}
                    onBlur={() => {
                      if (url.trim() && !normalizeUrl(url)) setErrors((p) => ({ ...p, url: BAD_URL }));
                    }}
                    aria-invalid={errors.url ? true : undefined}
                    aria-describedby={errors.url ? urlErrId : undefined}
                  />
                </div>
                {errors.url && <FieldError id={urlErrId}>{errors.url}</FieldError>}
                </div>
                <button type="submit" className={btn("primary", { size: "lg" })} disabled={submitting}>
                  {submitting ? (
                    <>
                      <span
                        className="size-[18px] animate-spin rounded-full border-[2.5px] border-current border-r-transparent"
                        aria-hidden="true"
                      />
                      กำลังย่อ…
                    </>
                  ) : (
                    <>
                      <SparkleIcon size={18} />
                      ย่อเลย!
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="group inline-flex min-h-11 cursor-pointer items-center gap-1.5 justify-self-start px-1 font-semibold text-orange-text"
              aria-expanded={showMore}
              aria-controls={`${ids}-more`}
              onClick={() => setShowMore((v) => !v)}
            >
              ตั้งชื่อเอง &amp; วันหมดอายุ
              <ChevronDown size={14} className="transition-transform duration-200 group-aria-expanded:rotate-180" />
            </button>

            {showMore && (
              <div
                id={`${ids}-more`}
                className="grid animate-pop-in gap-[18px] rounded-3xl border-[1.5px] border-dashed border-line-strong bg-surface-2 p-[18px] sm:grid-cols-2"
              >
                <div className="grid content-start gap-2">
                  <label className="text-[0.95rem] font-semibold" htmlFor={`${ids}-alias`}>
                    ชื่อลิงก์ <span className="ml-1 font-normal text-muted">(ไม่บังคับ)</span>
                  </label>
                  <input
                    ref={aliasRef}
                    id={`${ids}-alias`}
                    className={inputClass({ className: "font-mono" })}
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={ALIAS_MAX}
                    placeholder="my-cat"
                    value={alias}
                    onChange={(e) => {
                      setAlias(e.target.value);
                      if (errors.alias) setErrors((p) => ({ ...p, alias: undefined }));
                    }}
                    aria-invalid={errors.alias ? true : undefined}
                    aria-describedby={errors.alias ? `${aliasErrId} ${aliasHintId}` : aliasHintId}
                  />
                  {errors.alias && <FieldError id={aliasErrId}>{errors.alias}</FieldError>}
                  <p id={aliasHintId} className="text-sm text-muted">
                    ใช้ได้เฉพาะ a–z, A–Z, 0–9, - และ _ ยาว 3–16 ตัวอักษร หากไม่ระบุ ระบบจะสร้างให้อัตโนมัติ
                  </p>
                </div>

                <fieldset className="m-0 grid min-w-0 content-start gap-2 border-0 p-0">
                  <legend className="mb-2 p-0 text-[0.95rem] font-semibold">หมดอายุเมื่อไหร่</legend>
                  <div className="flex flex-wrap gap-2">
                    {EXPIRY_OPTIONS.map((o) => (
                      <label key={o.value} className="relative">
                        <input
                          type="radio"
                          className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
                          name={`${ids}-expiry`}
                          value={o.value}
                          checked={expiry === o.value}
                          onChange={() => {
                            setExpiry(o.value);
                            if (errors.expiry) setErrors((p) => ({ ...p, expiry: undefined }));
                          }}
                        />
                        <span className="inline-flex min-h-10 items-center rounded-full border-2 border-line bg-surface px-3.5 text-[0.92rem] font-medium transition-colors peer-checked:border-orange peer-checked:bg-orange-tint peer-checked:font-semibold peer-hover:border-line-strong peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {expiry === "custom" && (
                    <>
                      <label className="sr-only" htmlFor={`${ids}-custom`}>
                        วันและเวลาหมดอายุ
                      </label>
                      <input
                        ref={customRef}
                        id={`${ids}-custom`}
                        className={inputClass({ className: "mt-1" })}
                        type="datetime-local"
                        value={customExpiry}
                        onChange={(e) => {
                          setCustomExpiry(e.target.value);
                          if (errors.expiry) setErrors((p) => ({ ...p, expiry: undefined }));
                        }}
                        aria-invalid={errors.expiry ? true : undefined}
                        aria-describedby={errors.expiry ? expiryErrId : undefined}
                      />
                    </>
                  )}
                  {errors.expiry && <FieldError id={expiryErrId}>{errors.expiry}</FieldError>}
                </fieldset>
              </div>
            )}

            {serverError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-danger-soft px-4 py-3.5 font-medium text-danger">
                <AlertIcon size={16} className="mt-1 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
