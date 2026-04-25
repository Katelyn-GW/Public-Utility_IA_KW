import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Classes for the scrollable column (padding, overflow, celestial scroll tokens). */
  scrollClassName: string;
};

/**
 * Scroll column + fixed right rail whose thumb position/size track scroll progress.
 * Native scrollbar is hidden on the scroll column (see theme); the rail replaces macOS overlay bars.
 */
export function CelestialModalScrollWithRail({ children, scrollClassName }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 32, visible: false });

  const syncThumb = useCallback(() => {
    const scrollEl = scrollRef.current;
    const railEl = railRef.current;
    if (!scrollEl || !railEl) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    const track = railEl.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0 || track <= 0) {
      setThumb({ top: 0, height: 0, visible: false });
      return;
    }

    const minThumb = 28;
    const thumbH = Math.max(minThumb, Math.round((clientHeight / scrollHeight) * track));
    const travel = Math.max(1, track - thumbH);
    const top = Math.round((scrollTop / maxScroll) * travel);

    setThumb({ top, height: thumbH, visible: true });
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const railEl = railRef.current;
    const contentEl = contentRef.current;

    const scheduleSync = () => {
      requestAnimationFrame(syncThumb);
    };

    scheduleSync();
    const ro = new ResizeObserver(scheduleSync);
    if (scrollEl) ro.observe(scrollEl);
    if (railEl) ro.observe(railEl);
    if (contentEl) ro.observe(contentEl);

    window.addEventListener("resize", syncThumb);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncThumb);
    };
  }, [syncThumb]);

  return (
    <div className="flex min-h-0 flex-1">
      <div ref={scrollRef} className={scrollClassName} onScroll={syncThumb}>
        <div ref={contentRef}>{children}</div>
      </div>
      <div
        ref={railRef}
        className="celestial-modal-scroll-rail shrink-0 self-stretch"
        aria-hidden="true"
      >
        {thumb.visible ? (
          <span
            className="celestial-modal-scroll-rail__thumb"
            style={{ top: thumb.top, height: thumb.height }}
          />
        ) : null}
      </div>
    </div>
  );
}
