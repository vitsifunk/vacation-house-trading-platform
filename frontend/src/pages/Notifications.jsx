import { useEffect, useState } from "react";
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
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

export default function Notifications() {
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
  const [deletingId, setDeletingId] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

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
    try {
      const modified = await markAllNotificationsRead();
      toast.success(`${modified} notification(s) marked as read.`);
      await load();
    } catch {
      setError("Failed to mark all as read.");
      toast.error("Failed to mark all notifications as read.");
    }
  }

  async function removeOne(id) {
    const ok = window.confirm("Delete this notification?");
    if (!ok) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteNotification(id);
      toast.success("Notification deleted.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete notification.");
      toast.error("Failed to delete notification.");
    } finally {
      setDeletingId("");
    }
  }

  async function removeAll() {
    const ok = window.confirm("Delete all notifications?");
    if (!ok) return;
    setDeletingAll(true);
    setError("");
    try {
      const deleted = await deleteAllNotifications();
      toast.success(`${deleted} notification(s) deleted.`);
      setData((prev) => ({ ...prev, page: 1 }));
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to delete all notifications.",
      );
      toast.error("Failed to delete all notifications.");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Notifications</h2>
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
        <div className="actions-row">
          <button onClick={markAllRead}>Mark all read</button>
          <button
            onClick={removeAll}
            disabled={deletingAll}
            className="danger-btn"
          >
            {deletingAll ? "Deleting..." : "Delete all"}
          </button>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading notifications..." />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          body="You are all caught up. New activity will appear here."
          actionLabel="Browse Houses"
          actionTo="/houses"
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
                    <strong className="card-heading">{n.title}</strong>
                    <span className="card-subtle">{fmtDate(n.createdAt)}</span>
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
                      <button
                        onClick={() => removeOne(n._id)}
                        disabled={deletingId === n._id}
                        className="danger-btn"
                      >
                        {deletingId === n._id ? "Deleting..." : "Delete"}
                      </button>
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
