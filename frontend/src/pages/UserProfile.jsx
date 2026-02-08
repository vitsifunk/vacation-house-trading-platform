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

  if (loading) return <div className="page">Loading user profile...</div>;
  if (error) return <div className="page text-error">{error}</div>;
  if (!user) return <div className="page">User not found.</div>;

  return (
    <div className="page">
      <Link className="card-link" to="/houses">
        Back to houses
      </Link>
      <section className="panel section-gap mt-sm profile-panel">
        <h2 className="page-title">{user.name}</h2>
        <div className="text-muted mb-sm">Member since {fmtDate(user.createdAt)}</div>
        {user.location ? <p><strong>Location:</strong> {user.location}</p> : null}
        {user.bio ? (
          <p className="profile-bio">{user.bio}</p>
        ) : (
          <p className="text-muted">No bio yet.</p>
        )}
      </section>

      <section className="section-gap">
        <h3 className="section-title">Published Houses ({houses.length})</h3>
        {houses.length === 0 ? (
          <div className="panel">No published houses.</div>
        ) : (
          <div className="cards-grid">
            {houses.map((h) => (
              <HouseCard key={h._id} house={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
