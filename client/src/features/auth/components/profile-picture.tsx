"use client";

import { useEffect, useState } from "react";

export function ProfilePicture({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  className: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  return (
    <div
      role="img"
      aria-label={alt || "Profile picture"}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--green-soft)] text-xs font-bold text-[var(--green-dark)] ${className}`}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </div>
  );
}
