import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

export default function Notifications() {
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
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchNotifications({
        unreadOnly: unreadOnly ? "true" : "false",
        page: data.page,
        limit: data.limit,
      });
      setData((prev) => ({
        ...prev,
        ...res,
      }));
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly, data.page]);

  async function markRead(id) {
    setBusyId(id);
    setError("");
    try {
      await markNotificationRead(id);
      await load();
    } catch {
      setError("Failed to mark notification as read.");
    } finally {
      setBusyId("");
    }
  }

  async function markAllRead() {
    setError("");
    setMessage("");
    try {
      const modified = await markAllNotificationsRead();
      setMessage(`${modified} notification(s) marked as read.`);
      await load();
    } catch {
      setError("Failed to mark all as read.");
    }
  }

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2>Notifications</h2>
      {error ? <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div> : null}
      {message ? <div style={{ color: "green", marginBottom: 10 }}>{message}</div> : null}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
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
        <button onClick={markAllRead}>Mark all read</button>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : data.items.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {data.items.map((n) => {
            const unread = !n.readAt;
            return (
              <article
                key={n._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                  background: unread ? "#fffdf5" : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong>{n.title}</strong>
                  <span style={{ color: "#666" }}>{fmtDate(n.createdAt)}</span>
                </div>
                <p style={{ margin: "8px 0" }}>{n.body}</p>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: unread ? "#b00020" : "#2d7f36" }}>
                    {unread ? "Unread" : "Read"}
                  </span>
                  {unread ? (
                    <button
                      onClick={() => markRead(n._id)}
                      disabled={busyId === n._id}
                    >
                      {busyId === n._id ? "Saving..." : "Mark read"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
