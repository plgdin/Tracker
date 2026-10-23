import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface LandingIntroProps {
  storeName?: string;
  targetElementId?: string;
  onFinished?: () => void;
}

// Halftone math helpers
function hwfHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function hwfRadius(coverage: number, gap: number): number {
  const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
  return Math.sqrt(c) * gap * 0.58;
}

function hwfStep(
  x: number, y: number, vx: number, vy: number,
  hx: number, hy: number, px: number, py: number, r: number,
): [number, number, number, number] {
  const dx = x - px;
  const dy = y - py;
  const d2 = dx * dx + dy * dy;
  if (r > 0 && d2 < r * r) {
    const d = Math.sqrt(d2) + 0.001;
    const f = (1 - d / r) * 2.8;
    vx += (dx / d) * f;
    vy += (dy / d) * f;
  }
  vx = (vx + (hx - x) * 0.05) * 0.84;
  vy = (vy + (hy - y) * 0.05) * 0.84;
  return [x + vx, y + vy, vx, vy];
}

function hwfWarmth(x: number, y: number, hx: number, hy: number, span: number): number {
  const d = Math.hypot(x - hx, y - hy);
  return span > 0 ? Math.min(1, d / span) : 0;
}

export const LandingIntro: React.FC<LandingIntroProps> = ({
  storeName = 'Bake & Joy',
  targetElementId = 'storefront-navbar-logo',
  onFinished,
}) => {
  const [stage, setStage] = useState<'idle' | 'animating' | 'done'>('idle');
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [hintOpacity, setHintOpacity] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordmarkBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solidTextRef = useRef<HTMLSpanElement>(null);
  const hasTriggered = useRef(false);

  // Halftone simulation refs
  const dotsRef = useRef<Float32Array>(new Float32Array(0));
  const dotsCountRef = useRef(0);
  const pointerRef = useRef({ x: -1e5, y: -1e5 });
  const ringRef = useRef({ x: 0, y: 0, t: -1 });
  const isReducedMotion = useRef(false);

  const colors = {
    bg: '#F9F4EE',
    ink: '#4A2818',
    warm: '#C87D55',
  };

  const inkRgb = hwfHex(colors.ink) || [74, 40, 24];
  const warmRgb = hwfHex(colors.warm) || [200, 125, 85];

  // Trigger smooth transition into navbar
  const triggerTransition = () => {
    if (hasTriggered.current || stage !== 'idle') return;
    hasTriggered.current = true;
    setStage('animating');
    setHintOpacity(0);

    const targetElem = document.getElementById(targetElementId);
    const boxElem = wordmarkBoxRef.current;

    if (targetElem && boxElem) {
      const targetRect = targetElem.getBoundingClientRect();
      const originRect = boxElem.getBoundingClientRect();

      const deltaX = targetRect.left - originRect.left;
      const deltaY = targetRect.top - originRect.top;
      const scale = targetRect.height / originRect.height;

      setTransformStyle({
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'transform 1050ms cubic-bezier(0.16, 1, 0.3, 1), opacity 950ms ease',
      });

      // Gradually fade out background overlay to reveal storefront underneath
      setTimeout(() => {
        setOverlayOpacity(0);
      }, 50);

      // Finish and cleanup
      setTimeout(() => {
        setStage('done');
        if (onFinished) {
          onFinished();
        }
      }, 1050);
    } else {
      setOverlayOpacity(0);
      setTimeout(() => {
        setStage('done');
        if (onFinished) {
          onFinished();
        }
      }, 600);
    }
  };

  // Halftone Canvas simulation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = wordmarkBoxRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let awake = true;
    let visible = true;
    let grainTile: HTMLCanvasElement | null = null;

    const gap = 6;
    const pushRadius = 85;

    const layout = () => {
      const rect = box.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Create 1x mask canvas
      const mask = document.createElement('canvas');
      mask.width = w;
      mask.height = h;
      const m = mask.getContext('2d', { willReadFrequently: true });
      if (!m) return;

      const fontStack = "'DM Serif Display', 'Playfair Display', Georgia, serif";
      const testSize = 100;
      m.font = `italic 700 ${testSize}px ${fontStack}`;
      const measured = m.measureText(storeName).width;

      const targetWidth = Math.min(w * 0.92, 980);
      const fitSize = measured > 0 ? Math.min(Math.round((targetWidth / measured) * testSize), Math.round(h * 0.72)) : 60;

      m.font = `italic 700 ${fitSize}px ${fontStack}`;
      m.fillStyle = '#000';
      m.textBaseline = 'middle';
      m.textAlign = 'center';
      m.fillText(storeName, w / 2, h / 2);

      const img = m.getImageData(0, 0, w, h).data;
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const tmp: number[] = [];

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          const cov = sum / (9 * 255);
          if (cov < 0.05) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap));
        }
      }

      dotsRef.current = new Float32Array(tmp);
      dotsCountRef.current = tmp.length / 7;

      // Print grain tile
      grainTile = document.createElement('canvas');
      grainTile.width = 256;
      grainTile.height = 256;
      const g = grainTile.getContext('2d');
      if (g) {
        const id = g.createImageData(256, 256);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }

      awake = true;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const r = !isReducedMotion.current ? pushRadius : 0;
      const ring = ringRef.current;
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      const ringR = ringAge * 0.95;
      const dots = dotsRef.current;
      const count = dotsCountRef.current;
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      let moving = false;
      for (let i = 0; i < count; i++) {
        const j = i * 7;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];

        if (!isReducedMotion.current) {
          if (ringAge < 900) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 28);
            if (band > 0) {
              const f = band * 3.5 * (1 - ringAge / 900);
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }

          const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];

          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) {
            moving = true;
          } else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }

          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
        }

        const k = hwfWarmth(x, y, hx, hy, 28);
        ctx.fillStyle =
          k > 0.02
            ? 'rgb(' +
              Math.round(inkRgb[0] + (warmRgb[0] - inkRgb[0]) * k) + ',' +
              Math.round(inkRgb[1] + (warmRgb[1] - inkRgb[1]) * k) + ',' +
              Math.round(inkRgb[2] + (warmRgb[2] - inkRgb[2]) * k) + ')'
            : colors.ink;

        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, Math.PI * 2);
        ctx.fill();
      }

      if (grainTile) {
        ctx.globalAlpha = 0.05;
        ctx.globalCompositeOperation = 'overlay';
        const pattern = ctx.createPattern(grainTile, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      awake = moving || ringAge < 900 || px > -1e4;
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: MouseEvent | PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointerRef.current = { x: p[0], y: p[1] };
      wake();
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: -1e5, y: -1e5 };
      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      const p = toLocal(e);
      ringRef.current = { x: p[0], y: p[1], t: performance.now() };
      wake();
      // Trigger transition with brief ripple anticipation
      setTimeout(() => {
        triggerTransition();
      }, 140);
    };

    layout();
    draw(performance.now());
    wake();

    box.addEventListener('pointermove', onPointerMove);
    box.addEventListener('pointerleave', onPointerLeave);
    box.addEventListener('pointerdown', onPointerDown);

    const ro = new ResizeObserver(() => {
      layout();
      wake();
    });
    ro.observe(box);

    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    });
    io.observe(box);

    let alive = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!alive) return;
        layout();
        wake();
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener('pointermove', onPointerMove);
      box.removeEventListener('pointerleave', onPointerLeave);
      box.removeEventListener('pointerdown', onPointerDown);
    };
  }, [storeName]);

  // Global scroll & key event triggers
  useEffect(() => {
    if (stage !== 'idle') return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 5 || Math.abs(e.deltaX) > 5) {
        triggerTransition();
      }
    };

    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      if (Math.abs(currentY - startY) > 10) {
        triggerTransition();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'Enter'].includes(e.code)) {
        triggerTransition();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stage]);

  if (stage === 'done') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-1000 ${
        stage === 'animating' ? 'pointer-events-none' : ''
      }`}
      style={{
        backgroundColor: `rgba(249, 244, 238, ${overlayOpacity})`,
      }}
    >
      {/* Centered Large Halftone Wordmark Container */}
      <div 
        ref={wordmarkBoxRef}
        className="relative w-[92vw] max-w-4xl h-56 sm:h-72 md:h-80 flex items-center justify-center cursor-pointer"
        style={transformStyle}
        title="Move pointer to see spring dots · Click or scroll to enter"
      >
        {/* Halftone Canvas with Interactive Spring Dots */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-700 ${
            stage === 'animating' ? 'opacity-20' : 'opacity-100'
          }`}
        />

        {/* Crisp Solid Text that blends in as the logo reaches the navbar */}
        <span
          ref={solidTextRef}
          className={`absolute inset-0 flex items-center justify-center font-serif italic text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#4A2818] pointer-events-none transition-opacity duration-500 ${
            stage === 'animating' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {storeName}
        </span>
      </div>

      {/* Elegant Invitation Cue with subtle particle sparkle */}
      <div 
        className="mt-6 sm:mt-8 flex flex-col items-center gap-2 text-[#7A6153]/70 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: hintOpacity }}
      >
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C87D55]" />
          <span>Move to deflect dots · Click or scroll to enter</span>
        </div>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#4A2818]/60 mt-1" />
      </div>

    </div>
  );
};

export default LandingIntro;
