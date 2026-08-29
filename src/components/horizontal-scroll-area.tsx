"use client";

import { useEffect, useRef, useState } from "react";

export function HorizontalScrollArea({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const [rect, setRect] = useState({ left: 0, width: 0 });
  const [visible, setVisible] = useState(false);
  const syncing = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const content =
      (wrapper.querySelector('[data-slot="table-container"]') as HTMLElement | null) ??
      (wrapper.firstElementChild as HTMLElement | null);
    if (!content) return;
    contentRef.current = content;

    function actualizarMedidas() {
      setScrollWidth(content!.scrollWidth);
      setClientWidth(content!.clientWidth);
      const r = content!.getBoundingClientRect();
      setRect({ left: r.left, width: r.width });
    }
    actualizarMedidas();

    const resizeObserver = new ResizeObserver(actualizarMedidas);
    resizeObserver.observe(content);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    intersectionObserver.observe(content);

    window.addEventListener("resize", actualizarMedidas);
    window.addEventListener("scroll", actualizarMedidas, true);

    function onContentScroll() {
      if (syncing.current) {
        syncing.current = false;
        return;
      }
      if (trackRef.current) {
        syncing.current = true;
        trackRef.current.scrollLeft = content!.scrollLeft;
      }
    }
    content.addEventListener("scroll", onContentScroll);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("resize", actualizarMedidas);
      window.removeEventListener("scroll", actualizarMedidas, true);
      content.removeEventListener("scroll", onContentScroll);
    };
  }, []);

  function onTrackScroll() {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    if (trackRef.current && contentRef.current) {
      syncing.current = true;
      contentRef.current.scrollLeft = trackRef.current.scrollLeft;
    }
  }

  const necesitaScroll = scrollWidth > clientWidth + 1;

  return (
    <div ref={wrapperRef}>
      {children}
      {necesitaScroll && visible ? (
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="fixed bottom-0 z-30 overflow-x-auto overflow-y-hidden border-t border-border/60 bg-background/95 backdrop-blur [&::-webkit-scrollbar]:h-2.5"
          style={{ left: rect.left, width: rect.width, scrollbarGutter: "stable" }}
        >
          <div style={{ width: scrollWidth, height: 10 }} />
        </div>
      ) : null}
    </div>
  );
}
