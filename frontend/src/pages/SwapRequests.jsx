import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acceptSwap, fetchMySwaps, rejectSwap } from "../api/swaps";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

export default function SwapRequests() {
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
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Request action failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <div className="page">Loading swap requests...</div>;

  return (
    <div className="page">
      <h2 className="page-title">Swap Requests</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}

      {requests.length === 0 ? (
        <p>No pending swap requests.</p>
      ) : (
        <div className="stack-md">
          {requests.map((swap) => (
            <article
              key={swap._id}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div>
                <strong>Requester:</strong> {swap.requester?.name || "-"}
              </div>
              <div>
                <strong>Requester house:</strong> {swap.requesterHouse?.title || "-"}
              </div>
              <div>
                <strong>Your house:</strong> {swap.targetHouse?.title || "-"}
              </div>
              <div>
                <strong>Dates:</strong> {fmtDate(swap.startDate)} - {fmtDate(swap.endDate)}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Requester message:</strong>
                <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                  {swap.message?.trim() ? swap.message : "No message provided."}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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
                <Link style={{ alignSelf: "center" }} to={`/swaps/${swap._id}/chat`}>
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
