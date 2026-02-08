import { Link } from "react-router-dom";

export default function HouseCard({ house }) {
  return (
    <article className="card">
      <h3 className="card-title">{house.title}</h3>
      <p className="card-meta">
        {house.location?.city}, {house.location?.country}
      </p>
      <p className="card-meta">Capacity: {house.capacity}</p>
      <Link className="card-link" to={`/houses/${house._id}`}>
        View details
      </Link>
    </article>
  );
}
