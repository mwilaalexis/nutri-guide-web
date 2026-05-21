import { useEffect, useMemo, useState } from "react";
import { resolveProfileMediaUrlCandidates } from "../../utils/mediaUrl";

type ProfileImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  initials?: string;
};

export default function ProfileImage({
  src,
  alt = "",
  className,
  fallbackClassName,
  initials = "?",
}: ProfileImageProps) {
  const candidates = useMemo(() => resolveProfileMediaUrlCandidates(src), [src]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [src]);

  const resolved =
    failed || candidates.length === 0
      ? ""
      : candidates[Math.min(index, candidates.length - 1)] ?? "";

  const showImg = !failed && !!resolved;

  if (!showImg) {
    return (
      <span className={fallbackClassName ?? className} aria-hidden>
        {initials}
      </span>
    );
  }

  const handleError = () => {
    if (index + 1 < candidates.length) {
      setIndex((i) => i + 1);
      return;
    }
    setFailed(true);
  };

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      decoding="async"
      onError={handleError}
    />
  );
}
