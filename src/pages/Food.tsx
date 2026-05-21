import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FoodService } from "../services/food.service";
import type { FoodDto } from "../Types/global-types";
import { filterFoodsBySearch } from "../utils/foodSearch";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import FoodImage from "../components/media/FoodImage";

const SEARCH_DEBOUNCE_MS = 300;

function FoodTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <span className="food-tag food-tag--muted">—</span>;
  }
  const visible = tags.slice(0, 3);
  const extra = tags.length - visible.length;
  return (
    <div className="food-table__tags">
      {visible.map((t) => (
        <span key={t} className="food-tag">
          {t}
        </span>
      ))}
      {extra > 0 && <span className="food-tag food-tag--muted">+{extra}</span>}
    </div>
  );
}

export default function Foods() {
  const [foods, setFoods] = useState<FoodDto[]>([]);

  const [dietStyle, setDietStyle] = useState("vegan");
  const [avoidTags, setAvoidTags] = useState("nothing");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadData = () => {
    setLoading(true);
    setLoadError(null);
    FoodService.getAll(dietStyle, avoidTags, page, pageSize, debouncedSearch)
      .then((res) => {
        setFoods(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setFoods([]);
        const msg = httpErrorMessage(err, "Unable to load foods.");
        const hint =
          msg.includes("sign in") || msg.includes("Session")
            ? msg
            : `${msg} Run npm run check:gateway, then npm run dev, and open http://localhost:5174.`;
        setLoadError(hint);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, dietStyle, avoidTags, debouncedSearch]);

  const displayedFoods = useMemo(
    () => filterFoodsBySearch(foods, debouncedSearch),
    [foods, debouncedSearch],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const canGoNext = !loading && displayedFoods.length >= pageSize;
  const navState = { from: "/dashboard/food" };

  return (
    <div className="app-page food-page">
      <div className="food-page__header">
        <header className="app-page__header food-page__header-text">
          <p className="app-page__kicker">Admin</p>
          <h1 className="app-page__title">Food management</h1>
          <p className="app-page__subtitle">
            Browse, filter, and manage foods in the catalog.
          </p>
        </header>
        <Link to="/dashboard/food/new" className="btn btn-primary food-page__add-btn">
          Add food
        </Link>
      </div>

      <section className="app-panel food-page__controls" aria-label="Search and filters">
        <h2 className="food-page__controls-title">Search & filters</h2>
        <div className="food-page__controls-grid">
          <div className="food-field food-search">
            <label className="food-field__label" htmlFor="food-search">
              Search
            </label>
            <div className="food-search__field">
              <input
                id="food-search"
                type="search"
                className="app-input food-search__input"
                placeholder="Name, tag, diet type, ingredient…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoComplete="off"
                aria-describedby="food-search-meta"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
            <p id="food-search-meta" className="food-search__meta">
              {debouncedSearch
                ? `${displayedFoods.length} match${displayedFoods.length === 1 ? "" : "es"} on this page`
                : "Search by name, tags, diet type, or ingredients"}
            </p>
          </div>

          <div className="food-field">
            <label className="food-field__label" htmlFor="food-diet">
              Diet style
            </label>
            <input
              id="food-diet"
              className="app-input"
              placeholder="e.g. vegan"
              value={dietStyle}
              onChange={(e) => {
                setDietStyle(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="food-field">
            <label className="food-field__label" htmlFor="food-avoid">
              Exclude tags
            </label>
            <input
              id="food-avoid"
              className="app-input"
              placeholder="Comma-separated"
              value={avoidTags}
              onChange={(e) => {
                setAvoidTags(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button type="button" className="btn btn-secondary food-page__apply" onClick={loadData}>
            Apply filters
          </button>
        </div>
      </section>

      {loadError && (
        <p className="app-status app-status--err" role="alert">
          {loadError}
        </p>
      )}

      <section className="app-panel food-page__table-panel" aria-label="Food catalog">
        <div className="food-page__table-bar">
          <h2 className="food-page__table-title">Catalog</h2>
          <p
            className={`food-page__table-meta${loading ? " food-page__table-meta--loading" : ""}`}
            aria-live="polite"
          >
            {loading
              ? "Loading…"
              : debouncedSearch
                ? `${displayedFoods.length} result${displayedFoods.length === 1 ? "" : "s"} · page ${page}`
                : `${displayedFoods.length} item${displayedFoods.length === 1 ? "" : "s"} · page ${page}`}
          </p>
        </div>

        <div className="table-scroll">
          <table className="table m-0 food-table">
            <thead>
              <tr>
                <th>Food</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Tags</th>
                <th>Ingr.</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && displayedFoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="food-table__empty">
                    {debouncedSearch
                      ? "No foods match your search on this page."
                      : "No foods to display."}
                  </td>
                </tr>
              ) : (
                displayedFoods.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="food-table__name-cell">
                        <FoodImage src={f.imagePath} alt="" className="food-table__thumb" />
                        <Link
                          to={`/dashboard/foods/${f.id}`}
                          state={navState}
                          className="btn btn-link food-table__name"
                          style={{ padding: 0, fontWeight: 600 }}
                        >
                          {f.name}
                        </Link>
                      </div>
                    </td>
                    <td>{f.calories}</td>
                    <td>{f.protein}</td>
                    <td>{f.carbs}</td>
                    <td>{f.fat}</td>
                    <td>
                      <FoodTags tags={f.tags} />
                    </td>
                    <td>{f.ingredients.length}</td>
                    <td>
                      <div className="food-table__actions">
                        <Link
                          to={`/dashboard/foods/${f.id}`}
                          state={navState}
                          className="btn btn-sm btn-light"
                        >
                          View
                        </Link>
                        <Link to={`/dashboard/food/${f.id}/edit`} className="btn btn-sm btn-secondary">
                          Edit
                        </Link>
                        <Link to={`/dashboard/food/${f.id}/delete`} className="btn btn-sm btn-danger">
                          Delete
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="food-page__footer">
          <p className="food-page__page-hint">{pageSize} items per page</p>
          <nav className="food-page__pagination" aria-label="Pagination">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="food-page__page-indicator" aria-current="page">
              Page {page}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={!canGoNext}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </nav>
        </footer>
      </section>
    </div>
  );
}
