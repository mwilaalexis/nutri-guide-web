import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FoodService } from "../services/food.service";
import type { FoodDto } from "../Types/global-types";
import FoodImage from "../components/media/FoodImage";
import GallerySkeleton from "../components/ui/GallerySkeleton";
import type { CSSProperties } from "react";

function placeholderGradient(name: string) {
  const hue = ((name || "x").charCodeAt(0) * 37) % 360;
  return `linear-gradient(135deg, hsl(${hue} 28% 28%), hsl(${hue} 22% 18%))`;
}

export default function Gallery() {
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    FoodService.getCompatible()
      .then((res) => {
        setFoods(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setError("Unable to load recommendations. Please try again later.");
        setFoods([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[1400px]">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold text-[var(--accent-dark)] sm:text-3xl">Gallery</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-light)] sm:text-base">
          Foods compatible with your profile. Open a card to view details (read-only).
        </p>
      </header>

      {loading && <GallerySkeleton />}

      {error && !loading && (
        <p className="app-status app-status--err" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && foods.length === 0 && (
        <p className="app-panel text-center text-sm text-[var(--text-light)]">
          No compatible foods to display yet. Update your profile or check back later.
        </p>
      )}

      {!loading && !error && foods.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((food, index) => (
            <li
              key={food.id}
              className="min-w-0 ng-reveal"
              style={{ "--ng-delay": `${index * 45}ms` } as CSSProperties}
            >
              <Link
                to={`/dashboard/foods/${food.id}`}
                state={{ from: "/dashboard/gallery", viewOnly: true }}
                className="gallery-food-card group relative flex aspect-[4/3] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius)] border-0 bg-[var(--accent-dark)] p-0 text-left no-underline shadow-[var(--shadow)] outline-none ring-[var(--accent)] transition focus-visible:ring-2 sm:aspect-[3/2]"
              >
                <FoodImage
                  src={food.imagePath}
                  alt={food.name}
                  className="gallery-food-card__img absolute inset-0 z-[1] h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div
                  className="gallery-food-card__fallback absolute inset-0 z-0 bg-cover bg-center"
                  style={{ backgroundImage: placeholderGradient(food.name) }}
                  aria-hidden
                />
                <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="relative z-[3] px-3 py-3 sm:px-4 sm:py-4">
                  <h2 className="m-0 line-clamp-2 text-sm font-semibold text-white sm:text-base">
                    {food.name}
                  </h2>
                  <p className="mt-1 text-xs text-white/85 sm:text-sm">{food.calories} kcal</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
