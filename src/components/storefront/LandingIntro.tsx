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
  return Math.sqrt(c) * gap * 0.62;
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
    const f = (1 - d / r) * 3.6;
    vx += (dx / d) * f;
    vy += (dy / d) * f;
  }
  vx = (vx + (hx - x) * 0.06) * 0.82;
  vy = (vy + (hy - y) * 0.06) * 0.82;
  return [x + vx, y + vy, vx, vy];
}

export const LandingIntro: React.FC<LandingIntroProps> = ({
  storeName = 'NayaKart',
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

  // Intense glowing palette: Deep cocoa ink warming into blazing neon amber/terracotta
  const inkRgb: [number, number, number] = [74, 40, 24]; // #4A2818 deep artisan cocoa
  const warmRgb: [number, number, number] = [255, 95, 20]; // #FF5F14 vivid glowing ember

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
      }, 80);

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

    const gap = 5.5; // High resolution dots
    const pushRadius = 95; // Wide reactive hover radius

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

      const targetWidth = Math.min(w * 0.94, 1020);
      const fitSize = measured > 0 ? Math.min(Math.round((targetWidth / measured) * testSize), Math.round(h * 0.75)) : 70;

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
      // Shockwave speed: 1.15 px per ms, traveling across the word in ~800ms
      const ringR = ringAge * 1.15;
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

        let ringForce = 0;
        let ringWarmthBonus = 0;

        if (!isReducedMotion.current) {
          // Shockwave ripple physics
          if (ringAge < 850) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const bandWidth = 38;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / bandWidth);
            if (band > 0) {
              const power = (1 - ringAge / 850);
              ringForce = band * 5.4 * power;
              ringWarmthBonus = band * power * 1.35;
              vx += (dx / d) * ringForce;
              vy += (dy / d) * ringForce;
            }
          }

          const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];

          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.04) {
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

        // Highly sensitive warmth calculation: displacements + velocity + ripple
        const distFromHome = Math.hypot(x - hx, y - hy);
        const velocity = Math.hypot(vx, vy);
        let k = Math.min(1, distFromHome / 5.5 + velocity * 0.45 + ringWarmthBonus);

        // Radiant Glowing Color and Glow Shadow
        if (k > 0.06) {
          const red = Math.round(inkRgb[0] + (warmRgb[0] - inkRgb[0]) * k);
          const green = Math.round(inkRgb[1] + (warmRgb[1] - inkRgb[1]) * k);
          const blue = Math.round(inkRgb[2] + (warmRgb[2] - inkRgb[2]) * k);
          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

          // Genuine glowing halo when activated
          if (k > 0.2) {
            ctx.shadowColor = `rgba(${warmRgb[0]}, ${warmRgb[1]}, ${warmRgb[2]}, ${Math.min(1, k * 0.95)})`;
            ctx.shadowBlur = k * 16;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.fillStyle = '#4A2818';
          ctx.shadowBlur = 0;
        }

        // Slight dot blooming expansion when glowing
        const baseRadius = dots[j + 6];
        const displayRadius = baseRadius * (1 + k * 0.45);

        ctx.beginPath();
        ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      if (grainTile) {
        ctx.globalAlpha = 0.04;
        ctx.globalCompositeOperation = 'overlay';
        const pattern = ctx.createPattern(grainTile, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      awake = moving || ringAge < 850 || px > -1e4;
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

    const toLocal = (clientX: number, clientY: number) => {
      const b = canvas.getBoundingClientRect();
      return [clientX - b.left, clientY - b.top];
    };

    const onPointerMove = (e: PointerEvent) => {
      const [localX, localY] = toLocal(e.clientX, e.clientY);
      pointerRef.current = { x: localX, y: localY };
      wake();
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: -1e5, y: -1e5 };
      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      const [localX, localY] = toLocal(e.clientX, e.clientY);
      
      // Trigger instant glowing shockwave ripple!
      ringRef.current = { x: localX, y: localY, t: performance.now() };
      wake();

      // Allow the shockwave to radiate visibly across the full wordmark, then transition smoothly
      setTimeout(() => {
        triggerTransition();
      }, 700);
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

  // Global scroll, key event triggers, and 3-second auto-transition
  useEffect(() => {
    if (stage !== 'idle') return;

    // Automatically transition to storefront in 3 seconds without needing to click
    const autoTimer = setTimeout(() => {
      triggerTransition();
    }, 3000);

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
      clearTimeout(autoTimer);
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-1000 ${
        stage === 'animating' ? 'pointer-events-none' : ''
      }`}
      style={{
        backgroundColor: `rgba(249, 244, 238, ${overlayOpacity})`,
      }}
      onClick={(e) => {
        // If clicking outside canvas or wordmark, also trigger entry
        if (stage === 'idle') triggerTransition();
      }}
    >
      {/* Centered Large Halftone Wordmark Container */}
      <div 
        ref={wordmarkBoxRef}
        onClick={triggerTransition}
        className="relative w-[94vw] max-w-5xl h-64 sm:h-80 md:h-96 flex items-center justify-center cursor-pointer"
        style={transformStyle}
        title="Click or scroll to enter"
      >
        {/* Halftone Canvas with Interactive Glowing Spring Dots */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-700 ${
            stage === 'animating' ? 'opacity-20' : 'opacity-100'
          }`}
        />

        {/* Crisp Solid Text that smoothly takes over as logo nests into the navbar */}
        <span
          ref={solidTextRef}
          className={`absolute inset-0 flex items-center justify-center font-serif italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#4A2818] pointer-events-none transition-opacity duration-500 ${
            stage === 'animating' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {storeName}
        </span>
      </div>

      {/* Clean 'Click or scroll to enter' cue */}
      <div 
        onClick={triggerTransition}
        className="mt-6 sm:mt-8 flex items-center gap-2 text-[#7A6153] hover:text-[#4A2818] transition-all duration-300 cursor-pointer select-none"
        style={{ opacity: hintOpacity }}
      >
        <span className="text-xs sm:text-sm font-medium tracking-wide">
          Click or scroll to enter
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#4A2818]" />
      </div>

    </div>
  );
};

export default LandingIntro;
