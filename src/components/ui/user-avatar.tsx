"use client";

import Image from "next/image";

interface UserAvatarProps {
  /** Display name used to derive the initials fallback */
  name?: string | null;
  /** Email used as secondary initials source when name is absent */
  email?: string | null;
  /** Resolved profile image URL. When truthy, the real image is shown. */
  image?: string | null;
  /** Width/height in pixels. Defaults to 36. */
  size?: number;
  /** Extra className applied to the root element */
  className?: string;
}

/**
 * Shows the user's profile picture when one exists, otherwise falls back to
 * an initials badge on a primary-coloured circle.
 *
 * Rules:
 *  - `image` set   → render <Image> (rounded-full, object-cover)
 *  - `image` unset → render initials on bg-primary circle with white text
 */
export function UserAvatar({
  name,
  email,
  image,
  size = 36,
  className = "",
}: UserAvatarProps) {
  const initial =
    name?.charAt(0).toUpperCase() ||
    email?.charAt(0).toUpperCase() ||
    "U";

  const sizeStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    fontSize: Math.round(size * 0.38),
  };

  if (image) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={sizeStyle}
      >
        <Image
          src={image}
          alt={name ?? "User avatar"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-primary flex items-center justify-center text-white font-bold select-none flex-shrink-0 ${className}`}
      style={sizeStyle}
      aria-label={`${name ?? email ?? "User"} avatar`}
    >
      {initial}
    </div>
  );
}
