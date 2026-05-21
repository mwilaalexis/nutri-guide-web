import type { FoodDto } from "../../Types/global-types";
import FoodImage from "../media/FoodImage";

interface FoodCardProps {
  item: FoodDto;
  onClick: () => void;
}

export default function FoodCard({ item, onClick }: FoodCardProps) {
  return (
    <div className="food-card" onClick={onClick}>
      
    
      <FoodImage src={item.imagePath} alt={item.name} className="food-img" />

      <h3>{item.name}</h3>

      <p>{item.calories} kcal</p>

      <div className="macros">
        <span>{item.protein}g</span>
        <span>{item.carbs}g</span>
        <span>{item.fat}g</span>
      </div>

      <div className="tags">
        {(item.tags ?? []).map((t, i) => (
          <span key={i} className="tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
