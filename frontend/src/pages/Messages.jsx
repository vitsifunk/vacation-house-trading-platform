import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "../api/notifications";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useToast } from "../components/toastContext";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

export default function Messages() {
  const toast = useToast();
  const [data, setData] = useState({
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchNotifications({
        type: "message_received",
        unreadOnly: unreadOnly ? "true" : "false",
        page: data.page,
        limit: data.limit,
      });
      setData((prev) => ({ ...prev, ...res }));
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.page, unreadOnly]);

  async function markRead(id) {
    setBusyId(id);
    setError("");
    try {
      await markNotificationRead(id);
      await load();
      toast.success("Message marked as read.");
    } catch {
      setError("Failed to mark message as read.");
      toast.error("Failed to mark message as read.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Messages</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}
      <div className="split-row panel mb-sm">
        <div className="text-muted">
          {data.total} total
          {unreadOnly ? " (unread filter on)" : ""}
        </div>
        <label>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setData((prev) => ({ ...prev, page: 1 }));
              setUnreadOnly(e.target.checked);
            }}
          />{" "}
          Unread only
        </label>
      </div>

      {loading ? (
        <Loader label="Loading messages..." />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No messages yet"
          body="When a swap chat gets new activity, message notifications show up here."
          actionLabel="Go To Swaps"
          actionTo="/swaps"
        />
      ) : (
        <>
          <div className="stack-md">
            {data.items.map((n) => {
              const unread = !n.readAt;
              return (
                <article
                  key={n._id}
                  className={`card ${unread ? "card-unread" : ""}`}
                >
                  <div className="split-row">
                    <strong>{n.title}</strong>
                    <span className="text-muted">{fmtDate(n.createdAt)}</span>
                  </div>
                  <p className="mt-xs mb-sm">{n.body}</p>
                  <div className="split-row">
                    <span className={unread ? "text-error" : "text-success"}>
                      {unread ? "Unread" : "Read"}
                    </span>
                    <div className="actions-row">
                      {unread ? (
                        <button
                          onClick={() => markRead(n._id)}
                          disabled={busyId === n._id}
                        >
                          {busyId === n._id ? "Saving..." : "Mark read"}
                        </button>
                      ) : null}
                      {n.swap ? (
                        <Link className="btn-link" to={`/swaps/${n.swap}/chat`}>
                          Open Chat
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="panel split-row mt-sm">
            <span className="text-muted">
              Page {data.page} of {Math.max(data.pages || 1, 1)}
            </span>
            <div className="actions-row">
              <button
                type="button"
                disabled={data.page <= 1 || loading}
                onClick={() =>
                  setData((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
                }
              >
                Previous
              </button>
              <button
                type="button"
                disabled={data.page >= (data.pages || 1) || loading}
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, data.pages || 1),
                  }))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
