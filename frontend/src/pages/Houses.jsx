import { useEffect, useState } from "react";
import HouseCard from "../components/HouseCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { fetchHouses } from "../api/houses";

export default function Houses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    country: "",
    city: "",
    minCapacity: "",
  });

  async function loadHouses(query = {}) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHouses(query);
      setHouses(data.items || []);
    } catch {
      setError("Failed to load houses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await loadHouses();
    })();

    return () => {
      alive = false;
    };
  }, []);

  function handleChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = {};
    for (const [k, v] of Object.entries(filters)) {
      if (String(v).trim() !== "") query[k] = v;
    }
    await loadHouses(query);
  }

  async function handleReset() {
    const reset = { q: "", country: "", city: "", minCapacity: "" };
    setFilters(reset);
    await loadHouses();
  }

  if (loading)
    return (
      <div className="page">
        <Loader label="Loading houses..." />
      </div>
    );
  if (error)
    return <div className="page text-error">{error}</div>;

  return (
    <div className="page">
      <h2 className="page-title">Houses</h2>
      <form onSubmit={handleSearch} className="panel filters-grid">
        <input
          name="q"
          placeholder="Keyword"
          value={filters.q}
          onChange={handleChange}
        />
        <input
          name="country"
          placeholder="Country"
          value={filters.country}
          onChange={handleChange}
        />
        <input
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleChange}
        />
        <input
          name="minCapacity"
          placeholder="Min capacity"
          value={filters.minCapacity}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      {houses.length === 0 ? (
        <EmptyState
          title="No houses found"
          body="Try adjusting your filters or clear them to see more listings."
          actionLabel="Reset Filters"
          actionOnClick={handleReset}
        />
      ) : (
        <div className="cards-grid">
          {houses.map((h) => (
            <HouseCard key={h._id} house={h} />
          ))}
        </div>
      )}
    </div>
  );
}
