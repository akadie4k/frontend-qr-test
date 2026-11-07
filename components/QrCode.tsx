import { encodeQr, qrPath } from "@/lib/qr";

const BORDER = 4;
const BADGE_RATIO = 0.22; // share of the code width covered by the cat badge (ECC H tolerates ~30%)

interface QrLayout {
  size: number; // full viewBox size incl. quiet zone
  path: string;
  badge: { x: number; y: number; w: number };
}

function layout(value: string): QrLayout {
  const qr = encodeQr(value, "H");
  let w = Math.round(qr.size * BADGE_RATIO);
  if ((qr.size - w) % 2 !== 0) w++;
  const o = (qr.size - w) / 2;
  const skip = (x: number, y: number) => x >= o && x < o + w && y >= o && y < o + w;
  return {
    size: qr.size + BORDER * 2,
    path: qrPath(qr, BORDER, skip),
    badge: { x: o + BORDER, y: o + BORDER, w },
  };
}

const INK = "#3A2316";
const FUR = "#F7943B";
const STRIPE = "#C85F12";
const EAR = "#FFC2CF";

/** Cat badge drawn in a 0..100 box. */
function badgeMarkup(): string {
  return `
    <rect x="2" y="2" width="96" height="96" rx="26" fill="#fff"/>
    <path d="M22 44 L27 14 L48 30 Z" fill="${FUR}" stroke="${FUR}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M78 44 L73 14 L52 30 Z" fill="${FUR}" stroke="${FUR}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M28 36 L30 23 L39 31 Z" fill="${EAR}"/>
    <path d="M72 36 L70 23 L61 31 Z" fill="${EAR}"/>
    <ellipse cx="50" cy="58" rx="34" ry="29" fill="${FUR}"/>
    <path d="M50 30 V39 M42 32 Q43 36 45 40 M58 32 Q57 36 55 40" stroke="${STRIPE}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
    <ellipse cx="38" cy="57" rx="4.6" ry="5.6" fill="${INK}"/>
    <ellipse cx="62" cy="57" rx="4.6" ry="5.6" fill="${INK}"/>
    <circle cx="39.6" cy="55" r="1.7" fill="#fff"/>
    <circle cx="63.6" cy="55" r="1.7" fill="#fff"/>
    <path d="M46 65 H54 L50 69.5 Z" fill="#F58BA6" stroke="#F58BA6" stroke-width="2" stroke-linejoin="round"/>
    <path d="M50 69.5 Q47 74 43.5 71.5 M50 69.5 Q53 74 56.5 71.5" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>
  `;
}

/** Full standalone SVG string — used for PNG download. */
export function qrSvgString(value: string, px = 1024): string {
  const { size, path, badge } = layout(value);
  const s = badge.w / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}">
  <rect width="${size}" height="${size}" fill="#fff"/>
  <path d="${path}" fill="${INK}" shape-rendering="crispEdges"/>
  <g transform="translate(${badge.x} ${badge.y}) scale(${s})">${badgeMarkup()}</g>
</svg>`;
}

interface QrCodeProps {
  value: string;
  label?: string;
  className?: string;
}

export function QrCode({ value, label, className }: QrCodeProps) {
  const { size, path, badge } = layout(value);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={label ?? `QR code ของ ${value}`}
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill={INK} shapeRendering="crispEdges" />
      <g
        transform={`translate(${badge.x} ${badge.y}) scale(${badge.w / 100})`}
        dangerouslySetInnerHTML={{ __html: badgeMarkup() }}
      />
    </svg>
  );
}
