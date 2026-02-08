import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicUser, fetchPublicUserHouses } from "../api/users";
import HouseCard from "../components/HouseCard";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [profile, listings] = await Promise.all([
          fetchPublicUser(id),
          fetchPublicUserHouses(id),
        ]);
        if (!alive) return;
        setUser(profile);
        setHouses(listings);
      } catch {
        if (alive) setError("Failed to load user profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading user profile...</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;
  if (!user) return <div style={{ padding: 24 }}>User not found.</div>;

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <Link to="/houses">Back to houses</Link>
      <h2 style={{ marginBottom: 8 }}>{user.name}</h2>
      <div style={{ color: "#666", marginBottom: 8 }}>
        Member since {fmtDate(user.createdAt)}
      </div>
      {user.location ? <p><strong>Location:</strong> {user.location}</p> : null}
      {user.bio ? <p style={{ maxWidth: 780 }}>{user.bio}</p> : <p>No bio yet.</p>}

      <section style={{ marginTop: 18 }}>
        <h3>Published Houses ({houses.length})</h3>
        {houses.length === 0 ? (
          <p>No published houses.</p>
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
      </section>
    </div>
  );
}
