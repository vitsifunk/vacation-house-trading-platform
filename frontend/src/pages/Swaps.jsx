import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelSwap, fetchMySwaps } from "../api/swaps";
import { createReview, fetchMyGivenReviews } from "../api/reviews";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useToast } from "../components/toastContext";
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

function isCompletedSwap(swap) {
  return new Date(swap.endDate) < new Date();
}

function getReviewee(swap, role) {
  return role === "received" ? swap.requester : swap.targetOwner;
}

function ReviewForm({
  draft,
  disabled,
  onChange,
  onSubmit,
}) {
  return (
    <form className="review-form mt-sm" onSubmit={onSubmit}>
      <label>
        Rating
        <select
          value={draft.rating}
          onChange={(e) => onChange({ ...draft, rating: Number(e.target.value) })}
          disabled={disabled}
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating}
            </option>
          ))}
        </select>
      </label>
      <label>
        Comment
        <textarea
          rows={3}
          maxLength={1000}
          value={draft.comment}
          onChange={(e) => onChange({ ...draft, comment: e.target.value })}
          disabled={disabled}
        />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={disabled}>
          {disabled ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

function SwapItem({
  swap,
  role,
  onCancel,
  busy,
  reviewDraft,
  reviewBusy,
  reviewed,
  onReviewDraftChange,
  onReview,
}) {
  const canCancel = canCancelAcceptedSwap(swap);
  const completed = isCompletedSwap(swap);
  const reviewee = getReviewee(swap, role);
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
          disabled={busy || !canCancel || completed}
          className="danger-btn"
        >
          {busy ? "Cancelling..." : "Cancel Swap"}
        </button>
      </div>
      {!canCancel && !completed ? (
        <div className="text-muted mt-xs">
          Cancellation is allowed only up to {CANCELLATION_CUTOFF_DAYS} days before start date.
        </div>
      ) : null}
      {completed ? (
        reviewed ? (
          <div className="text-success mt-sm">Review submitted.</div>
        ) : (
          <ReviewForm
            draft={reviewDraft}
            disabled={reviewBusy}
            onChange={onReviewDraftChange}
            onSubmit={(e) => {
              e.preventDefault();
              onReview(swap, reviewee);
            }}
          />
        )
      ) : null}
    </article>
  );
}

export default function Swaps() {
  const toast = useToast();
  const [data, setData] = useState({ sent: [], received: [] });
  const [reviewedKeys, setReviewedKeys] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [reviewingId, setReviewingId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [result, givenReviews] = await Promise.all([
        fetchMySwaps(),
        fetchMyGivenReviews(),
      ]);
      setData({
        sent: (result.sent || []).filter((s) => s.status === "accepted"),
        received: (result.received || []).filter((s) => s.status === "accepted"),
      });
      setReviewedKeys(
        (givenReviews.items || []).map(
          (r) => `${r.swap?._id || r.swap}-${r.reviewee?._id || r.reviewee}`,
        ),
      );
    } catch {
      setError("Failed to load swaps");
    } finally {
      setLoading(false);
    }
  }

  function reviewKey(swap, reviewee) {
    return `${swap._id}-${reviewee?._id || reviewee}`;
  }

  function getDraft(swapId) {
    return reviewDrafts[swapId] || { rating: 5, comment: "" };
  }

  async function onReview(swap, reviewee) {
    const revieweeId = reviewee?._id || reviewee;
    if (!revieweeId) {
      setError("Could not determine who to review.");
      return;
    }

    setReviewingId(swap._id);
    setError("");
    try {
      const draft = getDraft(swap._id);
      await createReview({
        swapId: swap._id,
        revieweeId,
        rating: Number(draft.rating),
        comment: draft.comment.trim(),
      });
      setReviewedKeys((prev) => [...new Set([...prev, reviewKey(swap, reviewee)])]);
      toast.success("Review submitted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review");
      toast.error("Failed to submit review.");
    } finally {
      setReviewingId("");
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
                  reviewDraft={getDraft(s._id)}
                  reviewBusy={reviewingId === s._id}
                  reviewed={reviewedKeys.includes(reviewKey(s, getReviewee(s, "received")))}
                  onReviewDraftChange={(draft) =>
                    setReviewDrafts((prev) => ({ ...prev, [s._id]: draft }))
                  }
                  onReview={onReview}
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
                  reviewDraft={getDraft(s._id)}
                  reviewBusy={reviewingId === s._id}
                  reviewed={reviewedKeys.includes(reviewKey(s, getReviewee(s, "sent")))}
                  onReviewDraftChange={(draft) =>
                    setReviewDrafts((prev) => ({ ...prev, [s._id]: draft }))
                  }
                  onReview={onReview}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
