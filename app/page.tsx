import { PawIcon } from "@/components/icons";
import { ShortenPanel } from "@/components/ShortenPanel";
import { Container } from "@/components/ui";

export default function Home() {
  return (
    <section className="pt-10 pb-6 lg:pt-16 lg:pb-10">
      <Container>
        <div className="mx-auto max-w-[760px] text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-orange-text shadow-sm">
            <PawIcon size={14} />
            ย่อลิงก์ + QR code ในคลิกเดียว
          </p>
          <h1 className="mt-[18px] text-[clamp(2rem,6.2vw,3.6rem)] leading-tight font-bold">
            ลิงก์ยาวเกินไป? ให้

            <div className="py-4">    
              <span className="relative isolate whitespace-nowrap text-orange-text after:absolute after:inset-x-[-2%] after:bottom-[0.08em] after:-z-10 after:h-[0.3em] after:rounded-full after:bg-orange-tint after:content-['']">
              น้องแมวส้ม
              </span>
            ย่อให้สั้นกุ๊กกิ๊ก
            </div>
        
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[clamp(1rem,2.4vw,1.15rem)] text-ink-soft">
            วางลิงก์แล้วรับลิงก์สั้นพร้อม QR code ลายแมวไปแชร์ได้ทันที แถมดูยอดคลิกย้อนหลังได้ทุกลิงก์
          </p>
        </div>
        <ShortenPanel />
      </Container>
    </section>
  );
}
