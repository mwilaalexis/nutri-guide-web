import { useEffect, useMemo, useState } from "react";
import { FOOD_PLACEHOLDER, resolveMediaUrlCandidates } from "../../utils/mediaUrl";

type FoodImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export default function FoodImage({ src, alt = "", className }: FoodImageProps) {
  const candidates = useMemo(() => resolveMediaUrlCandidates(src), [src]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [src]);

  const displaySrc =
    failed || candidates.length === 0
      ? FOOD_PLACEHOLDER
      : candidates[Math.min(index, candidates.length - 1)] ?? FOOD_PLACEHOLDER;

  const handleError = () => {
    if (index + 1 < candidates.length) {
      setIndex((i) => i + 1);
      return;
    }
    setFailed(true);
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
