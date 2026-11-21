"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";

/** Poster first (no YouTube chrome, no iframe until tapped), then the privacy-enhanced player. */
export function Video({ id, title, className, onPlay }: { id: string; title: string; className?: string; onPlay?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const box = cn("relative block aspect-video w-full overflow-hidden rounded-2xl bg-muted", className);

  if (playing) {
    return (
      <iframe
        // keep keyboard focus on the video after the poster button disappears
        ref={(el) => el?.focus()}
        className={cn(box, "animate-in fade-in duration-300 ease-enter motion-reduce:animate-none")}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" onClick={() => (setPlaying(true), onPlay?.())} aria-label={`Video „${title}“ abspielen`} className={cn(box, "group cursor-pointer")}>
      {/* plain img: a fixed YouTube thumbnail URL, nothing for next/image to optimise */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        // a cached image can finish before hydration, so also check `complete`
        ref={(el) => { if (el?.complete) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        className={cn("size-full object-cover transition-opacity duration-300 ease-enter motion-reduce:transition-none", loaded ? "opacity-100" : "opacity-0")}
      />
      <span className="absolute inset-0 grid place-items-center bg-foreground/10 transition-colors group-hover:bg-foreground/20">
        <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_16px_-2px_hsl(var(--shadow-color)/0.45)] transition-transform duration-200 ease-enter group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none">
          <Play aria-hidden className="ml-1 size-7 fill-current" />
        </span>
      </span>
    </button>
  );
}
