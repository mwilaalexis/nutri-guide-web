import { useState } from "react";
import FoodGallery from "../components/Food/FoodGallery";
import Navbar from "../layout/Navbar";

export default function GalleryPage() {
  const [dietStyle, setDietStyle] = useState("");
  const [avoidTags, setAvoidTags] = useState("");

  return (
    <main>
      <Navbar />
      <h1>Compatible foods</h1>

      <div className="filters">
        <input
          placeholder="Diet style"
          value={dietStyle}
          onChange={(e) => setDietStyle(e.target.value)}
        />

        <input
          placeholder="Tags to exclude (comma-separated)"
          value={avoidTags}
          onChange={(e) => setAvoidTags(e.target.value)}
        />
      </div>

      <FoodGallery dietStyle={dietStyle} avoidTags={avoidTags} />
    </main>
  );
}
