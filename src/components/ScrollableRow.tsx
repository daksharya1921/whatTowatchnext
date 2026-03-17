import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableRowProps {
  children: ReactNode;
}

export default function ScrollableRow({ children }: ScrollableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [children]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/scroll flex items-center">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-3 z-10 w-12 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black/80 hover:text-white text-white/70"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-3 z-10 w-12 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black/80 hover:text-white text-white/70"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
      {/* Edge fade gradients */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-3 w-16 bg-gradient-to-r from-black to-transparent z-[5] pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-black to-transparent z-[5] pointer-events-none" />
      )}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent"
      >
        {children}
      </div>
    </div>
  );
}
