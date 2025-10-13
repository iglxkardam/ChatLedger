"use client";

import { useEffect, useRef, useState } from "react";

// Design Optimization Checker Component
export default function DesignOptimizer({ children }) {
  const [overlaps, setOverlaps] = useState([]);
  const [performance, setPerformance] = useState({ fps: 60, renderTime: 0 });
  const containerRef = useRef(null);

  // Check for overlapping elements
  const checkOverlaps = () => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const elements = containerRef.current.querySelectorAll('[data-check-overlap]');
    const newOverlaps = [];

    elements.forEach((element, index) => {
      const rect1 = element.getBoundingClientRect();
      
      elements.forEach((otherElement, otherIndex) => {
        if (index >= otherIndex) return;
        
        const rect2 = otherElement.getBoundingClientRect();
        
        // Check for overlap
        const isOverlapping = !(
          rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom
        );

        if (isOverlapping) {
          newOverlaps.push({
            element1: element,
            element2: otherElement,
            rect1,
            rect2
          });
        }
      });
    });

    setOverlaps(newOverlaps);
  };

  // Performance monitoring removed

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check overlaps on mount and resize
    checkOverlaps();

    const handleResize = () => {
      setTimeout(checkOverlaps, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', checkOverlaps);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', checkOverlaps);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {children}
      
      {/* Performance display removed */}
      
      {/* Visual overlap indicators */}
      {process.env.NODE_ENV === 'development' && overlaps.map((overlap, index) => (
        <div
          key={index}
          className="fixed border-2 border-red-500 bg-red-500/20 pointer-events-none z-40"
          style={{
            left: Math.min(overlap.rect1.left, overlap.rect2.left),
            top: Math.min(overlap.rect1.top, overlap.rect2.top),
            width: Math.max(overlap.rect1.right, overlap.rect2.right) - Math.min(overlap.rect1.left, overlap.rect2.left),
            height: Math.max(overlap.rect1.bottom, overlap.rect2.bottom) - Math.min(overlap.rect1.top, overlap.rect2.top),
          }}
        />
      ))}
    </div>
  );
}

// Hook for adding overlap checking to elements
export function useOverlapCheck() {
  return { 'data-check-overlap': true };
}
