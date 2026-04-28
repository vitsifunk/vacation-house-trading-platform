import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acceptSwap, cancelSwap, fetchMySwaps, rejectSwap } from "../api/swaps";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useToast } from "../components/toastContext";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

export default function SwapRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMySwaps();
      setRequests((data.received || []).filter((s) => s.status === "pending"));
    } catch {
      setError("Failed to load swap requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAction(type, id) {
    setBusyId(id);
    setError("");
    try {
      if (type === "accept") await acceptSwap(id);
      if (type === "reject") await rejectSwap(id);
      toast.success(type === "accept" ? "Request accepted." : "Request rejected.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Request action failed");
      toast.error("Request action failed.");
    } finally {
      setBusyId("");
    }
  }

  async function onCancel(swap) {
    const ok = window.confirm(
      `Cancel this swap request for "${swap.targetHouse?.title || "-"}"?`,
    );
    if (!ok) return;
    setBusyId(swap._id);
    setError("");
    try {
      await cancelSwap(swap._id);
      toast.success("Swap request cancelled.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel request");
      toast.error("Failed to cancel request.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading swap requests..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">Swap Requests</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}

      {requests.length === 0 ? (
        <EmptyState
          title="No pending requests"
          body="New incoming swap requests will appear here."
          actionLabel="Browse Houses"
          actionTo="/houses"
        />
      ) : (
        <div className="stack-md">
          {requests.map((swap) => (
            <article key={swap._id} className="card swap-card">
              <div className="swap-meta-grid">
                <strong className="card-heading">Requester:</strong>{" "}
                <span>{swap.requester?.name || "-"}</span>
              </div>
              <div className="swap-meta-grid">
                <strong>Requester house:</strong> {swap.requesterHouse?.title || "-"}
              </div>
              <div className="swap-meta-grid">
                <strong>Your house:</strong> {swap.targetHouse?.title || "-"}
              </div>
              <div className="swap-meta-grid">
                <strong className="card-heading">Dates:</strong>{" "}
                <span className="card-subtle">
                  {fmtDate(swap.startDate)} - {fmtDate(swap.endDate)}
                </span>
              </div>
              <div className="mt-sm">
                <strong>Requester message:</strong>
                <div className="mt-xs text-prewrap">
                  {swap.message?.trim() ? swap.message : "No message provided."}
                </div>
              </div>
              <div className="actions-row mt-sm">
                <button
                  onClick={() => onAction("accept", swap._id)}
                  disabled={busyId === swap._id}
                >
                  Accept
                </button>
                <button
                  onClick={() => onAction("reject", swap._id)}
                  disabled={busyId === swap._id}
                >
                  Reject
                </button>
                <button
                  onClick={() => onCancel(swap)}
                  disabled={busyId === swap._id}
                  className="danger-btn"
                >
                  Cancel
                </button>
                <Link
                  className="btn-link"
                  to={`/swaps/${swap._id}/chat`}
                >
                  Open Chat
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
