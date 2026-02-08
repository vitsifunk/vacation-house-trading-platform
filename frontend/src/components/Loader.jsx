export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span className="text-muted">{label}</span>
    </div>
  );
}
