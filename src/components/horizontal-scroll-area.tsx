"use client";

import { useEffect, useRef, useState } from "react";

export function HorizontalScrollArea({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const content =
      (wrapper.querySelector('[data-slot="table-container"]') as HTMLElement | null) ??
      (wrapper.firstElementChild as HTMLElement | null);
    if (!content) return;
    contentRef.current = content;

    function actualizar() {
      setScrollWidth(content!.scrollWidth);
      setClientWidth(content!.clientWidth);
    }
    actualizar();

    const observer = new ResizeObserver(actualizar);
    observer.observe(content);

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
      observer.disconnect();
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
      {necesitaScroll ? (
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="sticky bottom-0 z-10 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-2.5"
          style={{ scrollbarGutter: "stable" }}
        >
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      ) : null}
    </div>
  );
}
