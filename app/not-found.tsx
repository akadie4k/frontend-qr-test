import Link from "next/link";
import { CatFace } from "@/components/Cat";
import { SparkleIcon } from "@/components/icons";
import { btn, cardClass, containerClass, cx } from "@/components/ui";

export default function NotFound() {
  return (
    <div className={containerClass}>
      <div className={cx(cardClass, "mt-10 grid justify-items-center gap-2.5 px-5 pt-10 pb-11 text-center")}>
        <CatFace mood="sad" className="mb-1.5 w-[150px]" />
        <h1 className="text-[1.45rem] font-bold">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="max-w-[420px] text-ink-soft">หน้านี้อาจถูกย้ายหรือไม่มีอยู่ในระบบ กรุณากลับไปที่หน้าแรก</p>
        <Link href="/" className={btn("primary", { className: "mt-3" })}>
          <SparkleIcon size={16} />
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
