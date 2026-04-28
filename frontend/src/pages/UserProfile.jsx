import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicUser, fetchPublicUserHouses } from "../api/users";
import { fetchUserReviews } from "../api/reviews";
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
  const [reviews, setReviews] = useState({
    items: [],
    summary: { avgRating: 0, count: 0 },
  });
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
        const reviewData = await fetchUserReviews(id);
        if (!alive) return;
        setUser(profile);
        setHouses(listings);
        setReviews(reviewData);
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
        <h3 className="section-title">Reviews</h3>
        <div className="panel">
          <div className="split-row">
            <strong>
              {reviews.summary?.count || 0} review
              {(reviews.summary?.count || 0) === 1 ? "" : "s"}
            </strong>
            <span className="rating-badge">
              {(reviews.summary?.avgRating || 0).toFixed(1)} / 5
            </span>
          </div>
          {(reviews.items || []).length === 0 ? (
            <p className="text-muted mb-sm">No reviews yet.</p>
          ) : (
            <div className="stack-md mt-sm">
              {reviews.items.map((review) => (
                <article key={review._id} className="review-item">
                  <div className="split-row">
                    <strong>{review.reviewer?.name || "User"}</strong>
                    <span className="rating-badge">{review.rating} / 5</span>
                  </div>
                  {review.comment ? (
                    <p className="text-prewrap">{review.comment}</p>
                  ) : (
                    <p className="text-muted">No comment provided.</p>
                  )}
                  <div className="text-muted">{fmtDate(review.createdAt)}</div>
                </article>
              ))}
            </div>
          )}
        </div>
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
