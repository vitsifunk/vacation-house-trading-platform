import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMe } from "../api/auth";
import { fetchSwapMessages, sendSwapMessage } from "../api/messages";

function fmtDateTime(input) {
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

export default function Chat() {
  const { id: swapId } = useParams();
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meData, msgs] = await Promise.all([getMe(), fetchSwapMessages(swapId)]);
      setMe(meData);
      setItems(msgs);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [swapId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  async function onSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    setError("");
    try {
      const message = await sendSwapMessage(swapId, trimmed);
      setItems((prev) => [...prev, message]);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading chat...</div>;

  return (
    <div style={{ padding: 24, color: "#222", maxWidth: 840 }}>
      <div style={{ marginBottom: 10 }}>
        <Link to="/swaps">Back to My Swaps</Link>
      </div>
      <h2 style={{ marginTop: 0 }}>Swap Chat</h2>
      {error ? <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div> : null}

      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 10,
          padding: 12,
          minHeight: 320,
          maxHeight: 460,
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {items.length === 0 ? (
          <p style={{ margin: 0 }}>No messages yet.</p>
        ) : (
          items.map((m) => {
            const mine = String(m.sender?._id) === String(me?.id);
            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: mine ? "#e8f2ff" : "#f6f6f6",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>
                    {m.sender?.name || "User"} - {fmtDateTime(m.createdAt)}
                  </div>
                  <div>{m.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          maxLength={1500}
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
