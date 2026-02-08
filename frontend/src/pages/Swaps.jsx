import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMySwaps } from "../api/swaps";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

function SwapItem({ swap, role }) {
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

  if (loading) return <div className="page">Loading swaps...</div>;

  return (
    <div className="page">
      <h2 className="page-title">My Swaps</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}
      <p className="text-muted">Only accepted swaps are shown here.</p>

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
            />
          ))
        )}
      </section>
    </div>
  );
}
