import { useEffect, useState } from "react";
import HouseCard from "../components/HouseCard";
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

  if (loading) return <div style={{ padding: 24 }}>Loading houses...</div>;
  if (error)
    return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2>Houses</h2>
      <form
        onSubmit={handleSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
          marginBottom: 18,
        }}
      >
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
        <p>No houses found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {houses.map((h) => (
            <HouseCard key={h._id} house={h} />
          ))}
        </div>
      )}
    </div>
  );
}
