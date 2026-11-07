import Link from "next/link";
import { Suspense } from "react";
import { CatFace } from "./Cat";
import { PawIcon } from "./icons";
import { NavLinks } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-[68px] border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full w-[min(100%-32px,1120px)] items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="NekoQR หน้าแรก"
          className="group inline-flex min-h-11 items-center gap-2.5 font-display text-[1.35rem] leading-none font-bold no-underline"
        >
          <CatFace className="w-[42px] transition-transform duration-300 ease-spring group-hover:-rotate-8 group-hover:scale-105" />
          <span>
            neko<span className="text-orange-text">qr</span>
          </span>
        </Link>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <NavLinks />
        </Suspense>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-dashed border-line-strong py-8 text-sm text-muted">
      <div className="mx-auto flex w-[min(100%-32px,1120px)] flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <PawIcon size={16} className="text-orange" />
          NekoQR — ย่อลิงก์ด้วยอุ้งเท้าน้องแมวส้ม
        </span>
        <span>ลิงก์สั้น · QR code · ยอดคลิก</span>
      </div>
    </footer>
  );
}
