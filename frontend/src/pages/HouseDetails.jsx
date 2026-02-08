import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMe } from "../api/auth";
import { fetchHouseById, fetchUserHouses } from "../api/houses";
import { createSwap } from "../api/swaps";

function fmtDate(input) {
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

export default function HouseDetails() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [me, setMe] = useState(null);
  const [myHouses, setMyHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapMsg, setSwapMsg] = useState("");
  const [swapError, setSwapError] = useState("");
  const [form, setForm] = useState({
    requesterHouseId: "",
    startDate: "",
    endDate: "",
    message: "",
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [meData, houseData] = await Promise.all([getMe(), fetchHouseById(id)]);
        const myHouseData = await fetchUserHouses(meData.id);

        if (!alive) return;
        setMe(meData);
        setHouse(houseData);
        setMyHouses(myHouseData);
        setForm((prev) => ({
          ...prev,
          requesterHouseId: myHouseData[0]?._id || "",
        }));
      } catch {
        if (alive) setError("Failed to load house details");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading details...</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;
  if (!house) return <div style={{ padding: 24 }}>House not found.</div>;

  const isOwnHouse = me && String(me.id) === String(house.owner?._id);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitSwap(e) {
    e.preventDefault();
    setSwapError("");
    setSwapMsg("");

    if (!form.requesterHouseId || !form.startDate || !form.endDate) {
      setSwapError("Please fill requester house and dates.");
      return;
    }

    setSwapLoading(true);
    try {
      const payload = {
        requesterHouseId: form.requesterHouseId,
        targetHouseId: id,
        startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${form.endDate}T00:00:00`).toISOString(),
        message: form.message.trim(),
      };

      await createSwap(payload);
      setSwapMsg("Swap request sent successfully.");
      setForm((prev) => ({ ...prev, startDate: "", endDate: "", message: "" }));
    } catch (err) {
      setSwapError(err?.response?.data?.message || "Failed to create swap request.");
    } finally {
      setSwapLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2 style={{ marginTop: 0 }}>{house.title}</h2>
      <p>
        {house.location?.city}, {house.location?.country}
      </p>
      <p>{house.description}</p>

      <div style={{ marginTop: 14 }}>
        <strong>Capacity:</strong> {house.capacity} | <strong>Rooms:</strong>{" "}
        {house.rooms} | <strong>Beds:</strong> {house.beds} | <strong>Baths:</strong>{" "}
        {house.baths}
      </div>

      <div style={{ marginTop: 14 }}>
        <strong>Owner:</strong> {house.owner?.name || "Unknown"}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Amenities:</strong>
        {house.amenities?.length ? (
          <ul>
            {house.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed.</p>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Availability:</strong>
        {house.availability?.length ? (
          <ul>
            {house.availability.map((r, i) => (
              <li key={`${r.startDate}-${r.endDate}-${i}`}>
                {fmtDate(r.startDate)} - {fmtDate(r.endDate)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No availability ranges set.</p>
        )}
      </div>

      <section style={{ marginTop: 20, borderTop: "1px solid #e5e5e5", paddingTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Request Swap</h3>

        {isOwnHouse ? (
          <p style={{ color: "#666" }}>You cannot request a swap for your own house.</p>
        ) : (
          <form onSubmit={submitSwap} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
            <label>
              Your house
              <select
                name="requesterHouseId"
                value={form.requesterHouseId}
                onChange={onChange}
                required
                style={{ width: "100%", marginTop: 4 }}
              >
                <option value="">Select your house</option>
                {myHouses.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.title} ({h.location?.city}, {h.location?.country})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start date
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={onChange}
                required
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>

            <label>
              End date
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={onChange}
                required
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>

            <label>
              Message (optional)
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={3}
                maxLength={800}
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>

            {swapError ? <div style={{ color: "crimson" }}>{swapError}</div> : null}
            {swapMsg ? <div style={{ color: "green" }}>{swapMsg}</div> : null}

            <button type="submit" disabled={swapLoading}>
              {swapLoading ? "Sending..." : "Send Swap Request"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
