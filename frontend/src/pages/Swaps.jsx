import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelSwap, fetchMySwaps } from "../api/swaps";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastProvider";
const CANCELLATION_CUTOFF_DAYS = 7;

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

function canCancelAcceptedSwap(swap) {
  const start = new Date(swap.startDate);
  const cutoff = new Date(start);
  cutoff.setDate(cutoff.getDate() - CANCELLATION_CUTOFF_DAYS);
  return new Date() <= cutoff;
}

function SwapItem({ swap, role, onCancel, busy }) {
  const canCancel = canCancelAcceptedSwap(swap);
  return (
    <article className="card swap-card">
      <div className="swap-meta-grid">
        <strong className="card-heading">Status:</strong> <span>{swap.status}</span>
      </div>
      <div className="swap-meta-grid">
        <strong className="card-heading">Dates:</strong>{" "}
        <span className="card-subtle">
          {fmtDate(swap.startDate)} - {fmtDate(swap.endDate)}
        </span>
      </div>
      <div className="swap-meta-grid">
        <strong>Requester house:</strong> {swap.requesterHouse?.title || "-"}
      </div>
      <div className="swap-meta-grid">
        <strong>Target house:</strong> {swap.targetHouse?.title || "-"}
      </div>

      {role === "received" ? (
        <div className="swap-meta-grid mt-sm">
          <strong>Requester:</strong> {swap.requester?.name || "-"}
        </div>
      ) : (
        <div className="swap-meta-grid mt-sm">
          <strong>Target owner:</strong> {swap.targetOwner?.name || "-"}
        </div>
      )}

      <div className="mt-sm">
        <Link className="btn-link" to={`/swaps/${swap._id}/chat`}>
          Open Chat
        </Link>
      </div>
      <div className="mt-sm">
        <button
          type="button"
          onClick={() => onCancel(swap)}
          disabled={busy || !canCancel}
          className="danger-btn"
        >
          {busy ? "Cancelling..." : "Cancel Swap"}
        </button>
      </div>
      {!canCancel ? (
        <div className="text-muted mt-xs">
          Cancellation is allowed only up to {CANCELLATION_CUTOFF_DAYS} days before start date.
        </div>
      ) : null}
    </article>
  );
}

export default function Swaps() {
  const toast = useToast();
  const [data, setData] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchMySwaps();
      setData({
        sent: (result.sent || []).filter((s) => s.status === "accepted"),
        received: (result.received || []).filter((s) => s.status === "accepted"),
      });
    } catch {
      setError("Failed to load swaps");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCancel(swap) {
    const ok = window.confirm(
      `Cancel swap between "${swap.requesterHouse?.title || "-"}" and "${swap.targetHouse?.title || "-"}"?`,
    );
    if (!ok) return;

    setBusyId(swap._id);
    setError("");
    try {
      await cancelSwap(swap._id);
      toast.success("Swap cancelled.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel swap");
      toast.error("Failed to cancel swap.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading swaps..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">My Swaps</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}
      <p className="text-muted">Only accepted swaps are shown here.</p>

      <section className="mt-md">
        <h3 className="section-title">Received</h3>
        {data.received.length === 0 ? (
          <EmptyState
            title="No accepted received swaps"
            body="Accepted swaps where you are the target owner will appear here."
            actionLabel="View Swap Requests"
            actionTo="/swap-requests"
          />
        ) : (
          <div className="stack-md">
            {data.received.map((s) => (
              <SwapItem
                key={s._id}
                swap={s}
                role="received"
                onCancel={onCancel}
                busy={busyId === s._id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-md">
        <h3 className="section-title">Sent</h3>
        {data.sent.length === 0 ? (
          <EmptyState
            title="No accepted sent swaps"
            body="Accepted swaps you requested will appear here."
            actionLabel="Browse Houses"
            actionTo="/houses"
          />
        ) : (
          <div className="stack-md">
            {data.sent.map((s) => (
              <SwapItem
                key={s._id}
                swap={s}
                role="sent"
                onCancel={onCancel}
                busy={busyId === s._id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
