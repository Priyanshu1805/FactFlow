"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

export default function FastGhostCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsPosRef = useRef<{ x: number; y: number }[]>([]);
  const { theme } = useTheme();
  const isDark = theme !== "light";

  useEffect(() => {
    // Avoid running on touch devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const numDots = 15;
    
    // Initialize dot positions at center or off-screen
    if (dotsPosRef.current.length === 0) {
      for (let i = 0; i < numDots; i++) {
        dotsPosRef.current.push({ x: -100, y: -100 });
      }
    }

    let animationFrameId: number;

    const render = () => {
      let { x, y } = mouseRef.current;

      dotsPosRef.current.forEach((dot, index) => {
        // Easing factor creates the springy trail. First dot follows fast, last dot follows slow.
        const ease = 0.35 - index * 0.015;
        
        dot.x += (x - dot.x) * Math.max(ease, 0.05);
        dot.y += (y - dot.y) * Math.max(ease, 0.05);

        const el = dotsRef.current[index];
        if (el) {
          // Hardware accelerated transform
          el.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%) scale(${1 - index * 0.04})`;
        }

        // The next dot follows the current dot
        x = dot.x;
        y = dot.y;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 25 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div 
        ref={containerRef} 
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        style={{ filter: "url(#goo)" }}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            className={`absolute top-0 left-0 rounded-full ${isDark ? 'bg-blue-400' : 'bg-indigo-500'}`}
            style={{
              width: `${24 - i * 0.8}px`,
              height: `${24 - i * 0.8}px`,
              opacity: 1 - i * 0.05,
              boxShadow: isDark ? "0 0 20px rgba(59,130,246,0.5)" : "0 0 20px rgba(99,102,241,0.5)",
              willChange: "transform",
              transform: "translate3d(-100px, -100px, 0)",
            }}
          />
        ))}
      </div>
    </>
  );
}
