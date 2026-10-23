import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface LandingIntroProps {
  storeName?: string;
  targetElementId?: string;
  onFinished?: () => void;
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
  const logoRef = useRef<HTMLSpanElement>(null);
  const hasTriggered = useRef(false);

  const triggerAnimation = () => {
    if (hasTriggered.current || stage !== 'idle') return;
    hasTriggered.current = true;
    setStage('animating');
    setHintOpacity(0);

    const targetElem = document.getElementById(targetElementId);
    const logoElem = logoRef.current;

    if (targetElem && logoElem) {
      const targetRect = targetElem.getBoundingClientRect();
      const originRect = logoElem.getBoundingClientRect();

      // Calculate translation offsets so origin top-left aligns with target top-left
      const deltaX = targetRect.left - originRect.left;
      const deltaY = targetRect.top - originRect.top;
      
      // Calculate scale based on height/width ratio
      const scaleX = targetRect.width / originRect.width;
      const scaleY = targetRect.height / originRect.height;
      const scale = Math.min(scaleX, scaleY) || (targetRect.height / originRect.height);

      setTransformStyle({
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
      });

      // Gradually fade out background overlay to reveal the page
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
      // Fallback if target element not found
      setOverlayOpacity(0);
      setTimeout(() => {
        setStage('done');
        if (onFinished) {
          onFinished();
        }
      }, 600);
    }
  };

  useEffect(() => {
    if (stage !== 'idle') return;

    // Handle scroll wheel
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 5 || Math.abs(e.deltaX) > 5) {
        triggerAnimation();
      }
    };

    // Handle touch move / swipe
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      if (Math.abs(currentY - startY) > 10) {
        triggerAnimation();
      }
    };

    // Handle key navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'Enter'].includes(e.code)) {
        triggerAnimation();
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
      onClick={triggerAnimation}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-1000 ${
        stage === 'animating' ? 'pointer-events-none' : ''
      }`}
      style={{
        backgroundColor: `rgba(249, 244, 238, ${overlayOpacity})`,
      }}
      title="Click or scroll to enter"
    >
      {/* Centered Large Logo Container */}
      <div className="relative flex flex-col items-center justify-center px-4">
        
        {/* Large Logo with exact Italic Serif typography */}
        <span
          ref={logoRef}
          className="font-serif italic font-normal tracking-tight text-[#4A2818] select-none text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-none transition-transform duration-300 hover:scale-102 inline-block whitespace-nowrap"
          style={{
            transformOrigin: 'top left',
            ...transformStyle,
          }}
        >
          {storeName}
        </span>

        {/* Elegant Subtle Invitation Hint */}
        <div 
          className="mt-10 sm:mt-12 flex flex-col items-center gap-2 text-[#7A6153]/70 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-[11px] sm:text-xs font-sans font-medium tracking-[0.25em] uppercase">
            Click or scroll to enter
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#4A2818]/60 mt-1" />
        </div>

      </div>
    </div>
  );
};
