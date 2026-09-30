'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';

/* ────────────────────────────────────────────────────────────────
 * Card colours
 * ──────────────────────────────────────────────────────────────── */

const CARD_COLORS: string[] = [
  '#1e3a8a',
  '#6d28d9',
  '#0f766e',
  '#9f1239',
];

const CARD_COLOR = '#1e3a8a';

const CARD_BG_FALLBACK =
  'linear-gradient(180deg, #1f2937 0%, #4b5563 40%, #d1d5db 80%, #f9fafb 100%)';

/* ────────────────────────────────────────────────────────────────
 * Image set
 * ──────────────────────────────────────────────────────────────── */

const IMAGES = ['/1.webp', '/2.webp', '/3.webp', '/4.webp'];
const IMAGE_COUNT = IMAGES.length;

const COPIES = 8;

const ITEMS: string[] = Array.from(
  { length: IMAGE_COUNT * COPIES },
  (_, i: number) => IMAGES[i % IMAGE_COUNT]
);

const RESET_AT = IMAGE_COUNT * (COPIES - 2);
const START_INDEX = IMAGE_COUNT;

const HOLD_MS = 1400;
const MOVE_S = 1.0;

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/* ────────────────────────────────────────────────────────────────
 * Card sizing
 * ──────────────────────────────────────────────────────────────── */

const CARD_W_RATIO = 300 / 720;
const CARD_ASPECT = 1;
const GAP_RATIO = 32 / 720;
const CARD_TOP_GAP_RATIO = 40 / 300;

const SCREENSHOT_SHADOW = [
  'drop-shadow(-14px 4px 22px rgba(0,0,0,0.45))',
  'drop-shadow(14px 4px 22px rgba(0,0,0,0.45))',
  'drop-shadow(0 12px 28px rgba(0,0,0,0.35))',
].join(' ');

const wrap = (i: number) => ((i % IMAGE_COUNT) + IMAGE_COUNT) % IMAGE_COUNT;

/* ────────────────────────────────────────────────────────────────
 * Colour helpers
 * ──────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();

  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  const n = parseInt(full, 16);

  if (Number.isNaN(n)) return [30, 58, 138];

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function mixWithWhite(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);

  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  );
}

function makeGradient(hex: string): string {
  return `linear-gradient(180deg, ${hex} 0%, ${mixWithWhite(
    hex,
    0.35
  )} 35%, ${mixWithWhite(hex, 0.78)} 75%, ${mixWithWhite(
    hex,
    0.96
  )} 100%)`;
}

function cardBackgroundFor(index: number): string {
  const colour =
    CARD_COLORS[index % Math.max(1, CARD_COLORS.length)] || CARD_COLOR;

  return colour ? makeGradient(colour) : CARD_BG_FALLBACK;
}

/* ────────────────────────────────────────────────────────────────
 * MacBook geometry
 * ──────────────────────────────────────────────────────────────── */

const LAPTOP_W = 1216;
const LAPTOP_H = 735;

const LAPTOP_MAX_W = 720;
const LAPTOP_VW = 0.75;

const SCREEN_LEFT = 9.21;
const SCREEN_TOP = 0.54;
const SCREEN_WIDTH = 81.58;
const SCREEN_HEIGHT = 88.84;

const NOTCH_WIDTH = 11.8;
const NOTCH_HEIGHT = 2.6;

const SCREEN_RADIUS = '22px 22px 0 0';
const CAMERA_SIZE = 1.1;

/* ────────────────────────────────────────────────────────────────
 * Card
 * ──────────────────────────────────────────────────────────────── */

interface ProjectCardProps {
  src: string;
  index: number;
  cardW: number;
  cardH: number;
  topGap: number;
}

function ProjectCard({
  src,
  index,
  cardW,
  cardH,
  topGap,
}: ProjectCardProps) {
  const bg = cardBackgroundFor(index);

  return (
    <motion.div
      style={{
        width: cardW,
        height: cardH,
      }}
      className="relative shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: bg,
        }}
      />

      <div
        className="absolute inset-0 flex items-end justify-center px-3 pb-0"
        style={{
          paddingTop: topGap,
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="max-h-full max-w-full object-contain object-bottom"
          style={{
            filter: SCREENSHOT_SHADOW,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Showcase
 * ──────────────────────────────────────────────────────────────── */

export default function ProjectShowcase() {
  const [vw, setVw] = useState(1440);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);

    update();

    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  const laptopW = Math.min(vw * LAPTOP_VW, LAPTOP_MAX_W);

  const laptopH = laptopW * (LAPTOP_H / LAPTOP_W);

  const cardW = laptopW * CARD_W_RATIO;
  const cardH = cardW / CARD_ASPECT;

  const gap = laptopW * GAP_RATIO;
  const step = cardW + gap;

  const topGap = cardH * CARD_TOP_GAP_RATIO;

  const xFor = (i: number) => -cardW / 2 - i * step;

  const indexFor = (v: number) =>
    Math.round(-(v + cardW / 2) / step);

  const x = useMotionValue(xFor(START_INDEX));

  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const currentIndexRef = useRef(START_INDEX);

  const [frame, setFrame] = useState({
    src: IMAGES[wrap(START_INDEX)],
    prev: IMAGES[wrap(START_INDEX)],
    id: 0,
  });

  const frameRef = useRef(frame);

  useMotionValueEvent(x, 'change', (v: number) => {
    const src = IMAGES[wrap(indexFor(v))];

    const current = frameRef.current;

    if (current.src === src) return;

    const next = {
      src,
      prev: current.src,
      id: current.id + 1,
    };

    frameRef.current = next;

    setFrame(next);
  });

  useEffect(() => {
    x.set(xFor(currentIndexRef.current));

    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve) =>
        setTimeout(resolve, ms)
      );

    const run = async () => {
      let current = currentIndexRef.current;

      try {
        while (!cancelled) {
          await wait(HOLD_MS);

          if (cancelled) return;

          if (current + 1 > START_INDEX + RESET_AT) {
            current -= RESET_AT;

            currentIndexRef.current = current;

            x.set(xFor(current));
          }

          current += 1;

          currentIndexRef.current = current;

          animRef.current = animate(
            x,
            xFor(current),
            {
              duration: MOVE_S,
              ease: EASE,
            }
          );

          await animRef.current;
        }
      } catch {
        /* animation stopped on unmount / resize */
      }
    };

    run();

    return () => {
      cancelled = true;
      animRef.current?.stop();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, cardW, step]);

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{
        height: `${laptopH + 40}px`,
      }}
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 75% at 50% 35%, rgba(255,255,255,0.06), rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[55%] z-0 h-[220px] -translate-x-1/2 rounded-[50%] blur-[100px]"
        style={{
          width: 'min(65vw, 720px)',
          background:
            'radial-gradient(ellipse at center, rgba(120,170,255,0.16), rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Project cards */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)',
        }}
      >
        <div
          className="absolute left-0"
          style={{
            top: `${(laptopH - cardH) / 2}px`,
          }}
        >
          <motion.div
            style={{
              x,
              paddingLeft: '50vw',
              width: 'max-content',
              willChange: 'transform',
            }}
            className="flex"
          >
            {ITEMS.map((src, i) => (
              <div
                key={i}
                style={{
                  marginRight:
                    i < ITEMS.length - 1 ? gap : 0,
                }}
              >
                <ProjectCard
                  src={src}
                  index={i}
                  cardW={cardW}
                  cardH={cardH}
                  topGap={topGap}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Laptop */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
        style={{
          width: laptopW,
          height: laptopH,
        }}
      >
        {/* Screen */}
        <div
          className="absolute overflow-hidden bg-black"
          style={{
            left: `${SCREEN_LEFT}%`,
            top: `${SCREEN_TOP}%`,
            width: `${SCREEN_WIDTH}%`,
            height: `${SCREEN_HEIGHT}%`,
            zIndex: 20,
            borderRadius: SCREEN_RADIUS,
          }}
        >
          {/* Previous image */}
          <img
            src={frame.prev}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: 'top center',
            }}
          />

          {/* Current image */}
          <motion.img
            key={frame.id}
            src={frame.src}
            alt=""
            draggable={false}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.45,
              ease: EASE,
            }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: 'top center',
            }}
          />

          {/* Screen reflection */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.025) 20%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 70%, rgba(0,0,0,0.10) 100%)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Screen edge */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: SCREEN_RADIUS,
              boxShadow:
                'inset 0 0 0 3px rgba(0,0,0,0.85), inset 0 0 28px rgba(0,0,0,0.45), inset 0 0 0 4px rgba(255,255,255,0.04)',
            }}
          />

          {/* Notch */}
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2"
            style={{
              width: `${NOTCH_WIDTH}%`,
              height: `${NOTCH_HEIGHT}%`,
            }}
          >
            <path
              d="
                M 0 0
                C 5 0, 8 2, 8 8
                L 8 12
                Q 8 20, 16 20
                L 84 20
                Q 92 20, 92 12
                L 92 8
                C 92 2, 95 0, 100 0
                Z
              "
              fill="black"
            />
          </svg>

          {/* Camera */}
          <svg
            viewBox="0 0 20 20"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${NOTCH_HEIGHT / 2}%`,
              width: `${CAMERA_SIZE}%`,
              aspectRatio: '1 / 1',
            }}
          >
            <circle
              cx="10"
              cy="10"
              r="10"
              fill="#2a2e2c"
            />

            <circle
              cx="10"
              cy="10"
              r="8.4"
              fill="#151817"
            />

            <circle
              cx="10"
              cy="10"
              r="6.6"
              fill="#0a0c0b"
            />

            <circle
              cx="10"
              cy="10"
              r="3.2"
              fill="#000000"
            />
          </svg>
        </div>

        {/* Laptop SVG */}
        <img
          src="/laptop.svg"
          alt="MacBook Pro"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{
            zIndex: 10,
          }}
        />
      </div>
    </section>
  );
}
