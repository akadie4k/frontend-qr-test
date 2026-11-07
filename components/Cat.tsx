/**
 * NekoQR's orange tabby mascot ("น้องส้ม"). Pure SVG, no state — the
 * mood prop swaps the eyes, CSS handles the blink / tail / ear wiggle.
 */

export type CatMood = "idle" | "curious" | "happy" | "sad" | "sleepy";

interface CatFaceProps {
  mood?: CatMood;
  /** show the two front paws (for peeking over a card edge) */
  paws?: boolean;
  className?: string;
  title?: string;
}

function Eyes({ mood }: { mood: CatMood }) {
  switch (mood) {
    case "happy":
      return (
        <g fill="none" stroke="var(--cat-ink)" strokeWidth="5.5" strokeLinecap="round">
          <path d="M63 93 Q73 80 83 93" />
          <path d="M117 93 Q127 80 137 93" />
        </g>
      );
    case "sleepy":
      return (
        <g fill="none" stroke="var(--cat-ink)" strokeWidth="5" strokeLinecap="round">
          <path d="M63 88 Q73 98 83 88" />
          <path d="M117 88 Q127 98 137 88" />
        </g>
      );
    case "sad":
      return (
        <g>
          <path d="M62 74 L82 80" stroke="var(--cat-stripe)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M138 74 L118 80" stroke="var(--cat-stripe)" strokeWidth="4.5" strokeLinecap="round" />
          <g className="origin-center [transform-box:fill-box] animate-blink motion-reduce:animate-none">
            <ellipse cx="73" cy="92" rx="8" ry="9" fill="var(--cat-ink)" />
            <ellipse cx="127" cy="92" rx="8" ry="9" fill="var(--cat-ink)" />
            <circle cx="75.5" cy="88.5" r="2.6" fill="#fff" />
            <circle cx="129.5" cy="88.5" r="2.6" fill="#fff" />
          </g>
          <path d="M66 104 q-3 6 0 9 q3 -3 0 -9z" fill="#8ECDF5" />
        </g>
      );
    case "curious":
      return (
        <g className="origin-center [transform-box:fill-box] animate-blink motion-reduce:animate-none">
          <ellipse cx="73" cy="90" rx="11" ry="12.5" fill="var(--cat-ink)" />
          <ellipse cx="127" cy="90" rx="11" ry="12.5" fill="var(--cat-ink)" />
          <circle cx="77" cy="85" r="4.2" fill="#fff" />
          <circle cx="131" cy="85" r="4.2" fill="#fff" />
          <circle cx="69.5" cy="95" r="1.8" fill="#fff" />
          <circle cx="123.5" cy="95" r="1.8" fill="#fff" />
        </g>
      );
    default:
      return (
        <g className="origin-center [transform-box:fill-box] animate-blink motion-reduce:animate-none">
          <ellipse cx="73" cy="91" rx="8.5" ry="10.5" fill="var(--cat-ink)" />
          <ellipse cx="127" cy="91" rx="8.5" ry="10.5" fill="var(--cat-ink)" />
          <circle cx="76" cy="87" r="3.2" fill="#fff" />
          <circle cx="130" cy="87" r="3.2" fill="#fff" />
        </g>
      );
  }
}

const EAR = "origin-bottom [transform-box:fill-box] motion-reduce:animate-none";

export function CatFace({ mood = "idle", paws = false, className, title }: CatFaceProps) {
  const earLeft = `${EAR} ${mood === "sad" ? "-rotate-8" : mood === "curious" ? "animate-ear-twitch-fast" : ""}`;
  const earRight = `${EAR} ${mood === "sad" ? "rotate-8" : "animate-ear-twitch"}`;
  return (
    <svg
      viewBox={paws ? "0 0 200 168" : "0 0 200 160"}
      className={[
        "overflow-visible",
        // colours used by the fill/stroke attributes below (dark-mode aware via globals.css tokens)
        "[--cat-fur:#f7943b] [--cat-stripe:var(--c-cat-stripe)] [--cat-ear:#ffc2cf] [--cat-muzzle:var(--c-cat-muzzle)] [--cat-nose:#f58ba6] [--cat-blush:#ff9fb5] [--cat-ink:var(--c-cat-ink)]",
        mood === "happy" ? "animate-hop motion-reduce:animate-none" : "",
        className ?? "",
      ].join(" ")}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* ears */}
      <g className={earLeft}>
        <path d="M40 72 L50 14 Q53 8 59 12 L96 44 Z" fill="var(--cat-fur)" stroke="var(--cat-fur)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M52 58 L57 28 L80 47 Z" fill="var(--cat-ear)" strokeLinejoin="round" stroke="var(--cat-ear)" strokeWidth="3" />
      </g>
      <g className={earRight}>
        <path d="M160 72 L150 14 Q147 8 141 12 L104 44 Z" fill="var(--cat-fur)" stroke="var(--cat-fur)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M148 58 L143 28 L120 47 Z" fill="var(--cat-ear)" strokeLinejoin="round" stroke="var(--cat-ear)" strokeWidth="3" />
      </g>

      {/* head */}
      <ellipse cx="100" cy="96" rx="72" ry="60" fill="var(--cat-fur)" />

      {/* tabby stripes */}
      <g stroke="var(--cat-stripe)" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M100 40 V58" />
        <path d="M84 44 Q86 52 89 58" />
        <path d="M116 44 Q114 52 111 58" />
        <path d="M30 88 H44" />
        <path d="M32 102 H45" />
        <path d="M170 88 H156" />
        <path d="M168 102 H155" />
      </g>

      {/* blush */}
      <ellipse cx="54" cy="112" rx="10" ry="6" fill="var(--cat-blush)" opacity="0.7" />
      <ellipse cx="146" cy="112" rx="10" ry="6" fill="var(--cat-blush)" opacity="0.7" />

      {/* muzzle */}
      <ellipse cx="89" cy="116" rx="15" ry="11" fill="var(--cat-muzzle)" />
      <ellipse cx="111" cy="116" rx="15" ry="11" fill="var(--cat-muzzle)" />

      <Eyes mood={mood} />

      {/* nose + mouth */}
      <path d="M93 104 H107 L100 112 Z" fill="var(--cat-nose)" stroke="var(--cat-nose)" strokeWidth="3" strokeLinejoin="round" />
      <g fill="none" stroke="var(--cat-ink)" strokeWidth="2.6" strokeLinecap="round">
        {mood === "sad" ? (
          <path d="M91 124 Q100 117 109 124" />
        ) : (
          <>
            <path d="M100 112 V116" />
            <path d="M100 116 Q95 122 89 118" />
            <path d="M100 116 Q105 122 111 118" />
          </>
        )}
      </g>

      {/* whiskers */}
      <g stroke="var(--cat-ink)" strokeWidth="2" strokeLinecap="round" opacity="0.45">
        <path d="M40 112 L14 106" />
        <path d="M41 119 L15 122" />
        <path d="M160 112 L186 106" />
        <path d="M159 119 L185 122" />
      </g>

      {mood === "sleepy" && (
        <g className="animate-zzz motion-reduce:animate-none" fill="var(--cat-stripe)" fontFamily="var(--font-display), sans-serif" fontWeight="700">
          <text x="160" y="40" fontSize="20">z</text>
          <text x="174" y="24" fontSize="14">z</text>
        </g>
      )}

      {paws && (
        <g>
          <ellipse cx="62" cy="152" rx="22" ry="14" fill="var(--cat-fur)" stroke="var(--cat-stripe)" strokeWidth="2.5" />
          <ellipse cx="138" cy="152" rx="22" ry="14" fill="var(--cat-fur)" stroke="var(--cat-stripe)" strokeWidth="2.5" />
          <g stroke="var(--cat-stripe)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M55 158 V150" />
            <path d="M69 158 V150" />
            <path d="M131 158 V150" />
            <path d="M145 158 V150" />
          </g>
        </g>
      )}
    </svg>
  );
}
