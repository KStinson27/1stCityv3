"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const PLACEHOLDER_LABELS = ["Kitchen", "Bedroom", "Bathroom", "Common area", "Exterior"];

export function PropertyGallery({
  photos,
  propertyName,
}: {
  photos: string[];
  propertyName: string;
}) {
  // Matches the visible main photo + up to 5 thumbnails below it.
  const visiblePhotos = photos.slice(0, 6);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    lastTriggerRef.current?.focus();
  }, []);

  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + visiblePhotos.length) % visiblePhotos.length));
  }, [visiblePhotos.length]);

  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % visiblePhotos.length));
  }, [visiblePhotos.length]);

  const open = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setOpenIndex(index);
  };

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, close, showPrev, showNext]);

  if (visiblePhotos.length === 0) {
    return (
      <>
        <div className="flex h-[280px] items-center justify-center rounded bg-[#eeeeee] shadow-card md:h-[420px]">
          <span className="text-sm text-[#9e9e9e]">Main property photo coming soon</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PLACEHOLDER_LABELS.map((label) => (
            <div
              key={label}
              className="flex h-[100px] items-center justify-center rounded bg-background shadow-card"
            >
              <span className="text-[11px] text-[#9e9e9e]">{label}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => open(0, e.currentTarget)}
        aria-label={`View ${propertyName} main photo full-size`}
        className="relative h-[280px] cursor-zoom-in overflow-hidden rounded shadow-card md:h-[420px]"
      >
        <Image
          src={visiblePhotos[0]}
          alt={`${propertyName} — main photo`}
          fill
          priority
          sizes="(min-width: 768px) 1024px, 100vw"
          className="object-cover"
        />
      </button>
      {visiblePhotos.length > 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {visiblePhotos.slice(1).map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={(e) => open(i + 1, e.currentTarget)}
              aria-label={`View ${propertyName} photo ${i + 2} full-size`}
              className="relative h-[100px] cursor-zoom-in overflow-hidden rounded shadow-card"
            >
              <Image
                src={photo}
                alt={`${propertyName} — photo ${i + 2}`}
                fill
                sizes="200px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${propertyName} photos, ${openIndex + 1} of ${visiblePhotos.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-10"
          onClick={close}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {visiblePhotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative h-full w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={visiblePhotos[openIndex]}
              alt={`${propertyName} — photo ${openIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {visiblePhotos.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {openIndex + 1} / {visiblePhotos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
