import { useEffect, useState } from "react";
import type { FoodDto } from "../../Types/global-types";
import { FoodService } from "../../services/food.service";
import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";

interface FoodGalleryProps {
  dietStyle?: string;
  avoidTags?: string;
}

export default function FoodGallery({ dietStyle = "", avoidTags = "" }: FoodGalleryProps) {
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDto | null>(null);

  useEffect(() => {
    FoodService.getCompatible().then((res) => {
      setFoods(res.data); 
    });
  }, [dietStyle, avoidTags]);

  return (
    <>
      <div className="gallery-container">
        {foods.map((f) => (
          <FoodCard key={f.id} item={f} onClick={() => setSelectedFood(f)} />
        ))}
      </div>

      {selectedFood && (
        <FoodModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}
    </>
  );
}
