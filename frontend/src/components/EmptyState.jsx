import { Link } from "react-router-dom";

export default function EmptyState({
  title,
  body,
  actionLabel,
  actionTo,
  actionOnClick,
}) {
  return (
    <div className="panel empty-state">
      <h3>{title}</h3>
      {body ? <p className="text-muted">{body}</p> : null}
      {actionTo ? (
        <Link className="btn-link mt-xs" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
      {!actionTo && actionOnClick ? (
        <button className="mt-xs" type="button" onClick={actionOnClick}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
