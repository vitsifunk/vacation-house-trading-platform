import { Link } from "react-router-dom";

export default function HouseCard({ house }) {
  return (
    <article
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
      }}
    >
      <h3 style={{ margin: 0 }}>{house.title}</h3>
      <p style={{ margin: "8px 0", color: "#555" }}>
        {house.location?.city}, {house.location?.country}
      </p>
      <p style={{ margin: "8px 0" }}>Capacity: {house.capacity}</p>
      <Link to={`/houses/${house._id}`}>View details</Link>
    </article>
  );
}
