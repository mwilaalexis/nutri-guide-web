import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IngredientsService } from "../services/ingredients.service";
import type { IngredientDto } from "../Types/global-types";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setError(false);

    IngredientsService.getAll()
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
            ? res.data.items
            : [];

        setIngredients(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-page">
      <div className="users-page__header">
        <header className="app-page__header">
          <p className="app-page__kicker">Admin</p>
          <h1 className="app-page__title">Ingredients</h1>
          <p className="app-page__subtitle">Manage the ingredient catalog.</p>
        </header>
        <Link to="/dashboard/ingredients/new" className="btn btn-primary">
          Add ingredient
        </Link>
      </div>

      {loading && <p>Loading ingredients…</p>}

      {error && (
        <p className="text-danger mt-3">Failed to load ingredients. Please try again.</p>
      )}

      {!loading && !error && (
        <section className="app-panel food-page__table-panel">
          <div className="table-scroll">
            <table className="table m-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="food-table__empty">
                      No ingredients found.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{i.calories}</td>
                      <td>{i.dietType}</td>
                      <td>
                        <Link
                          to={`/dashboard/ingredients/${i.id}/edit`}
                          className="btn btn-sm btn-light me-2"
                        >
                          Edit
                        </Link>
                        <Link to={`/dashboard/ingredients/${i.id}/delete`} className="btn btn-sm btn-danger">
                          Delete
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
