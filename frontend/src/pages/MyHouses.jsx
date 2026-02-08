import { useEffect, useState } from "react";
import {
  createHouse,
  deleteHouse,
  fetchMyHouses,
  updateHouse,
} from "../api/houses";
import { uploadImageFile } from "../api/uploads";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MyHouses() {
  const [houses, setHouses] = useState([]);
  const [photoDrafts, setPhotoDrafts] = useState({});
  const [newPhotoFiles, setNewPhotoFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    country: "",
    city: "",
    address: "",
    capacity: 2,
    startDate: todayIso(),
    endDate: plusDaysIso(7),
    status: "draft",
    photos: [],
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const items = await fetchMyHouses();
      setHouses(items);
      setPhotoDrafts(
        Object.fromEntries(items.map((h) => [h._id, h.photos || []])),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your houses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: {
          country: form.country,
          city: form.city,
          address: form.address || undefined,
        },
        capacity: Number(form.capacity),
        availability: [
          {
            startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
            endDate: new Date(`${form.endDate}T00:00:00`).toISOString(),
          },
        ],
        photos: form.photos,
        status: form.status,
      };

      await createHouse(payload);
      setMessage("House created.");
      setForm({
        title: "",
        description: "",
        country: "",
        city: "",
        address: "",
        capacity: 2,
        startDate: todayIso(),
        endDate: plusDaysIso(7),
        status: "draft",
        photos: [],
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create house");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id, status) {
    setError("");
    setMessage("");
    try {
      await updateHouse(id, { status });
      setMessage(status === "published" ? "House published." : "House moved to draft.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update house status");
    }
  }

  async function savePhotos(id) {
    setError("");
    setMessage("");
    try {
      await updateHouse(id, {
        photos: photoDrafts[id] || [],
      });
      setMessage("Photos updated.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update photos");
    }
  }

  async function onDeleteHouse(id, title) {
    const ok = window.confirm(
      `Delete listing "${title}"? This action cannot be undone.`,
    );
    if (!ok) return;

    setDeletingId(id);
    setError("");
    setMessage("");
    try {
      await deleteHouse(id);
      setMessage("Listing deleted.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeletingId("");
    }
  }

  async function addCreatePhotos(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const url = await uploadImageFile(file);
        if (url) urls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...urls].slice(0, 20),
      }));
    } catch {
      setError("Failed to upload selected image files.");
    } finally {
      setUploading(false);
    }
  }

  async function addListingPhotos(houseId, files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const url = await uploadImageFile(file);
        if (url) urls.push(url);
      }
      setPhotoDrafts((prev) => ({
        ...prev,
        [houseId]: [...(prev[houseId] || []), ...urls].slice(0, 20),
      }));
    } catch {
      setError("Failed to upload selected image files.");
    } finally {
      setUploading(false);
    }
  }

  function removeCreatePhoto(index) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }

  function removeListingPhoto(houseId, index) {
    setPhotoDrafts((prev) => ({
      ...prev,
      [houseId]: (prev[houseId] || []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2>My Houses</h2>
      {error ? <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div> : null}
      {message ? <div style={{ color: "green", marginBottom: 10 }}>{message}</div> : null}
      {uploading ? <div style={{ color: "#555", marginBottom: 10 }}>Uploading photos...</div> : null}

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 14,
          marginBottom: 18,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create House</h3>
        <form
          onSubmit={onCreate}
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          }}
        >
          <input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
          <input name="country" placeholder="Country" value={form.country} onChange={onChange} required />
          <input name="city" placeholder="City" value={form.city} onChange={onChange} required />
          <input name="address" placeholder="Address (optional)" value={form.address} onChange={onChange} />
          <input
            type="number"
            min={1}
            max={30}
            name="capacity"
            placeholder="Capacity"
            value={form.capacity}
            onChange={onChange}
            required
          />
          <select name="status" value={form.status} onChange={onChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input type="date" name="startDate" value={form.startDate} onChange={onChange} required />
          <input type="date" name="endDate" value={form.endDate} onChange={onChange} required />
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: 6 }}>Add Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addCreatePhotos(e.target.files)}
            />
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.photos.map((url, i) => (
                <div key={`create-photo-${i}`} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt={`new photo ${i + 1}`}
                    style={{
                      width: 92,
                      height: 68,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeCreatePhoto(i)}
                    style={{ position: "absolute", top: -6, right: -6 }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
          <textarea
            name="description"
            placeholder="Description (min 20 chars)"
            value={form.description}
            onChange={onChange}
            required
            minLength={20}
            style={{ gridColumn: "1 / -1" }}
            rows={3}
          />
          <button type="submit" disabled={saving} style={{ maxWidth: 220 }}>
            {saving ? "Saving..." : "Create House"}
          </button>
        </form>
      </section>

      <section>
        <h3>Your Listings</h3>
        {loading ? (
          <p>Loading...</p>
        ) : houses.length === 0 ? (
          <p>No houses yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {houses.map((h) => (
              <article
                key={h._id}
                style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong>{h.title}</strong>
                  <span>Status: {h.status}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  {h.location?.city}, {h.location?.country} - Capacity {h.capacity}
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Photos</strong>
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        setNewPhotoFiles((prev) => ({
                          ...prev,
                          [h._id]: e.target.files,
                        }));
                      }}
                    />
                    <button
                      type="button"
                      style={{ marginLeft: 8 }}
                      onClick={() => addListingPhotos(h._id, newPhotoFiles[h._id])}
                    >
                      Add Selected
                    </button>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(photoDrafts[h._id] || []).slice(0, 20).map((url, i) => (
                      <div key={`${h._id}-photo-${i}`} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`${h.title} ${i + 1}`}
                          style={{
                            width: 92,
                            height: 68,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ddd",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.opacity = "0.3";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeListingPhoto(h._id, i)}
                          style={{ position: "absolute", top: -6, right: -6 }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={() => savePhotos(h._id)}>Save Photos</button>
                  <button onClick={() => setStatus(h._id, "published")}>Publish</button>
                  <button onClick={() => setStatus(h._id, "draft")}>Move to Draft</button>
                  <button
                    onClick={() => onDeleteHouse(h._id, h.title)}
                    disabled={deletingId === h._id}
                  >
                    {deletingId === h._id ? "Deleting..." : "Delete Listing"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
