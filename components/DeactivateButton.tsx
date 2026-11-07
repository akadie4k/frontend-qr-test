"use client";

import { useRef, useState } from "react";
import { deactivateLink, errorMessage } from "@/lib/api";
import { prettyUrl } from "@/lib/format";
import { CatFace } from "./Cat";
import { BanIcon } from "./icons";
import { btn, cx, dialogClass } from "./ui";

interface Props {
  shortCode: string;
  shortUrl: string;
  variant?: "icon" | "full";
  onDone: () => void;
}

/** Asks for confirmation, then calls DELETE /api/v1/links/{shortCode}. */
export function DeactivateButton({ shortCode, shortUrl, variant = "full", onDone }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function confirm() {
    setBusy(true);
    setError(null);
    deactivateLink(shortCode)
      .then(() => {
        dialogRef.current?.close();
        onDone();
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          className={btn("danger", { size: "icon" })}
          onClick={open}
          aria-label={`ปิดใช้งาน ${prettyUrl(shortUrl)}`}
          title="ปิดใช้งาน"
        >
          <BanIcon size={16} />
        </button>
      ) : (
        <button type="button" className={btn("danger")} onClick={open}>
          <BanIcon size={16} />
          ปิดใช้งานลิงก์
        </button>
      )}

      <dialog
        ref={dialogRef}
        className={cx(dialogClass, "w-[min(100%-32px,400px)]")}
        aria-labelledby={`deact-${shortCode}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !busy) e.currentTarget.close();
        }}
      >
        <div className="grid justify-items-center gap-3 p-6 text-center">
          <CatFace mood="sad" className="w-24" />
          <h2 id={`deact-${shortCode}`} className="text-xl font-bold">
            ปิดใช้งานลิงก์นี้?
          </h2>
          <p className="text-ink-soft">
            <span className="font-mono font-semibold text-ink">{prettyUrl(shortUrl)}</span> จะพาไปลิงก์ต้นทางไม่ได้อีก
          </p>
          {error && (
            <p role="alert" className="w-full rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <div className="mt-2 flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              className={btn("ghost")}
              onClick={() => dialogRef.current?.close()}
              disabled={busy}
              autoFocus
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className={btn("solid-danger")}
              onClick={confirm}
              disabled={busy}
            >
              <BanIcon size={16} />
              {busy ? "กำลังปิด…" : "ปิดใช้งาน"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
