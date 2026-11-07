import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "@/components/icons";
import { LinkDetail, LinkDetailSkeleton } from "@/components/LinkDetail";
import { containerClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "สถิติลิงก์",
};

export default function LinkDetailPage({ params }: PageProps<"/links/[shortCode]">) {
  return (
    <div className={containerClass}>
      <Link
        href="/links"
        className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink-soft no-underline hover:text-ink"
      >
        <ArrowLeft size={14} />
        กลับไปลิงก์ของฉัน
      </Link>
      <Suspense fallback={<LinkDetailSkeleton />}>
        {params.then(({ shortCode }) => (
          <LinkDetail shortCode={shortCode} />
        ))}
      </Suspense>
    </div>
  );
}
