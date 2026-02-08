import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  acceptSwap,
  cancelSwap,
  fetchMySwaps,
  rejectSwap,
} from "../api/swaps";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

function SwapItem({ swap, role, onAction, busyId }) {
  const isPending = swap.status === "pending";

  return (
    <article
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div>
        <strong>Status:</strong> {swap.status}
      </div>
      <div>
        <strong>Dates:</strong> {fmtDate(swap.startDate)} - {fmtDate(swap.endDate)}
      </div>
      <div>
        <strong>Requester house:</strong> {swap.requesterHouse?.title || "-"}
      </div>
      <div>
        <strong>Target house:</strong> {swap.targetHouse?.title || "-"}
      </div>

      {role === "received" ? (
        <div style={{ marginTop: 8 }}>
          <strong>Requester:</strong> {swap.requester?.name || "-"}
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          <strong>Target owner:</strong> {swap.targetOwner?.name || "-"}
        </div>
      )}

      {isPending ? (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {role === "received" ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => onAction("cancel", swap._id)}
              disabled={busyId === swap._id}
            >
              Cancel
            </button>
          )}
        </div>
      ) : null}

      <div style={{ marginTop: 10 }}>
        <Link to={`/swaps/${swap._id}/chat`}>Open Chat</Link>
      </div>
    </article>
  );
}

export default function Swaps() {
  const [data, setData] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchMySwaps();
      setData(result);
    } catch {
      setError("Failed to load swaps");
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
      if (type === "cancel") await cancelSwap(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Swap action failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading swaps...</div>;

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2>My Swaps</h2>
      {error ? <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div> : null}

      <section style={{ marginTop: 16 }}>
        <h3>Received</h3>
        {data.received.length === 0 ? (
          <p>No received swap requests.</p>
        ) : (
          data.received.map((s) => (
            <SwapItem
              key={s._id}
              swap={s}
              role="received"
              onAction={onAction}
              busyId={busyId}
            />
          ))
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Sent</h3>
        {data.sent.length === 0 ? (
          <p>No sent swap requests.</p>
        ) : (
          data.sent.map((s) => (
            <SwapItem
              key={s._id}
              swap={s}
              role="sent"
              onAction={onAction}
              busyId={busyId}
            />
          ))
        )}
      </section>
    </div>
  );
}
