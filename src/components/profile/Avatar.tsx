import { type CSSProperties } from "react";
import ProfileImage from "../media/ProfileImage";

type AvatarProps = {
  fullName: string;
  src?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ fullName, src, size = 60, className = "" }: AvatarProps) {
  const initials = fullName
    ? fullName
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    : "?";

  return (
    <div
      className={`avatar-root ${className}`.trim()}
      style={
        {
          width: size,
          height: size,
          fontSize: Math.round(size * 0.36),
        } as CSSProperties
      }
    >
      <ProfileImage
        src={src}
        alt=""
        className="avatar-root__img"
        fallbackClassName="avatar-root__initials"
        initials={initials}
      />
    </div>
  );
}
