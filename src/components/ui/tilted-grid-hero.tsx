"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Strips per tile. 16 provides a smooth curve on the cylinder.
const SLICES = 16;

// Camera distance from the screen as a multiple of cylinder radius
const CAMERA = 1.6;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

const MAX_WIDTH = 55;

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const effectiveW = width > 0 ? width : 1200;
  const effectiveH = height > 0 ? height : 600;

  const h = Math.min(
    (tile / 100) * effectiveH,
    ((MAX_WIDTH / 100) * effectiveW) / aspect,
  );
  const radius = effectiveW * arc(bend);
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(3, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);

  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
    tileHeightPx: round(h > 0 ? h : 160),
    radiusPx: round(radius > 0 ? radius : 850),
    width: effectiveW,
    height: effectiveH,
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 28,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 78,
  fade = 14,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Initial layout so tiles render immediately without waiting for ResizeObserver
  const [layout, setLayout] = React.useState<ReturnType<typeof measure>>(() =>
    measure(1200, 620, tileHeight, aspectRatio, gap, bend)
  );

  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (w: number, h: number) => {
      const nextW = w > 0 ? w : el.offsetWidth || window.innerWidth || 1200;
      const nextH = h > 0 ? h : el.offsetHeight || 600;
      const next = measure(nextW, nextH, tileHeight, aspectRatio, gap, bend);

      setLayout((prev) =>
        prev.columns === next.columns &&
        prev.sweep === next.sweep &&
        prev.unit === next.unit &&
        Math.abs(prev.tileHeightPx - next.tileHeightPx) < 1
          ? prev
          : next
      );
    };

    update(el.offsetWidth, el.offsetHeight);

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      update(width, height);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Preload images
  React.useEffect(() => {
    for (const img of images) {
      if (img?.src) {
        const i = new Image();
        i.src = img.src;
      }
    }
  }, [images]);

  const { columns, sweep, unit, limit, tileHeightPx, radiusPx } = layout;

  const u = (n: number) => `${+(n * tileHeightPx).toFixed(2)}px`;
  const radius = `${radiusPx}px`;

  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden w-full", className)}
      {...props}
    >
      <style>{css}</style>

      {/* 3D Cylinder Row */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
        style={{
          opacity: 1,
          perspective: `${+(radiusPx * CAMERA).toFixed(2)}px`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];

          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-[#E8D8CC]/40 border-y border-[#E8D8CC]/60 shadow-md",
                    k === 0 && "rounded-l-2xl border-l",
                    k === SLICES - 1 && "rounded-r-2xl border-r"
                  )}
                  style={{
                    left: u((aspectRatio - share) / 2),
                    width:
                      k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1.2px)`,
                    height: u(1),
                    transform: turn(
                      (aspectRatio / 2 - (k + 0.5) * share) * unit
                    ),
                  }}
                >
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
