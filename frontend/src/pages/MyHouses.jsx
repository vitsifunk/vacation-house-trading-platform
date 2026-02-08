import { useEffect, useState } from "react";
import {
  createHouse,
  deleteHouse,
  fetchMyHouses,
  updateHouse,
} from "../api/houses";
import { uploadImageFile } from "../api/uploads";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const AMENITY_OPTIONS = [
  "WiFi",
  "Air Conditioning",
  "Heating",
  "Kitchen",
  "Washer",
  "Dryer",
  "Free Parking",
  "TV",
  "Pool",
  "Gym",
  "Balcony",
  "Garden",
  "Fireplace",
  "Elevator",
  "Workspace",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toDateInput(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function parseAmenities(text) {
  return String(text || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function getValidationErrors(values, options = {}) {
  const { requireDates = true } = options;
  const errors = [];

  const title = String(values.title || "").trim();
  const description = String(values.description || "").trim();
  const country = String(values.country || "").trim();
  const city = String(values.city || "").trim();
  const startDate = String(values.startDate || "").trim();
  const endDate = String(values.endDate || "").trim();

  const capacity = Number(values.capacity);
  const rooms =
    values.rooms === "" || values.rooms === undefined
      ? 0
      : Number(values.rooms);
  const beds =
    values.beds === "" || values.beds === undefined ? 0 : Number(values.beds);
  const baths =
    values.baths === "" || values.baths === undefined
      ? 0
      : Number(values.baths);

  if (title.length < 5) errors.push("Title must be at least 5 characters.");
  if (!country) errors.push("Country is required.");
  if (!city) errors.push("City is required.");
  if (description.length < 20)
    errors.push("Description must be at least 20 characters.");

  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 30) {
    errors.push("Capacity must be between 1 and 30.");
  }
  if (!Number.isFinite(rooms) || rooms < 0 || rooms > 50) {
    errors.push("Rooms must be between 0 and 50.");
  }
  if (!Number.isFinite(beds) || beds < 0 || beds > 50) {
    errors.push("Beds must be between 0 and 50.");
  }
  if (!Number.isFinite(baths) || baths < 0 || baths > 50) {
    errors.push("Baths must be between 0 and 50.");
  }

  if (requireDates) {
    if (!startDate || !endDate) {
      errors.push("Start date and end date are required.");
    } else if (new Date(startDate) >= new Date(endDate)) {
      errors.push("Start date must be before end date.");
    }
  } else if (startDate || endDate) {
    if (!startDate || !endDate) {
      errors.push("For availability updates, provide both start and end date.");
    } else if (new Date(startDate) >= new Date(endDate)) {
      errors.push("Start date must be before end date.");
    }
  }

  return errors;
}

function getValidationFlags(values, options = {}) {
  const { requireDates = true } = options;
  const title = String(values.title || "").trim();
  const description = String(values.description || "").trim();
  const country = String(values.country || "").trim();
  const city = String(values.city || "").trim();
  const startDate = String(values.startDate || "").trim();
  const endDate = String(values.endDate || "").trim();

  const capacity = Number(values.capacity);
  const rooms =
    values.rooms === "" || values.rooms === undefined
      ? 0
      : Number(values.rooms);
  const beds =
    values.beds === "" || values.beds === undefined ? 0 : Number(values.beds);
  const baths =
    values.baths === "" || values.baths === undefined
      ? 0
      : Number(values.baths);

  const invalidDateOrder =
    startDate && endDate && new Date(startDate) >= new Date(endDate);

  return {
    title: title.length < 5,
    description: description.length < 20,
    country: !country,
    city: !city,
    capacity: !Number.isFinite(capacity) || capacity < 1 || capacity > 30,
    rooms: !Number.isFinite(rooms) || rooms < 0 || rooms > 50,
    beds: !Number.isFinite(beds) || beds < 0 || beds > 50,
    baths: !Number.isFinite(baths) || baths < 0 || baths > 50,
    startDate: requireDates
      ? !startDate || invalidDateOrder
      : !!(startDate || endDate) && (!startDate || invalidDateOrder),
    endDate: requireDates
      ? !endDate || invalidDateOrder
      : !!(startDate || endDate) && (!endDate || invalidDateOrder),
  };
}

function makeEditDraft(house) {
  const firstRange = house.availability?.[0];
  return {
    title: house.title || "",
    description: house.description || "",
    country: house.location?.country || "",
    city: house.location?.city || "",
    address: house.location?.address || "",
    capacity: Number(house.capacity || 1),
    rooms:
      house.rooms === undefined || house.rooms === null || Number(house.rooms) === 0
        ? ""
        : Number(house.rooms),
    beds:
      house.beds === undefined || house.beds === null || Number(house.beds) === 0
        ? ""
        : Number(house.beds),
    baths:
      house.baths === undefined || house.baths === null || Number(house.baths) === 0
        ? ""
        : Number(house.baths),
    amenitiesText: (house.amenities || []).join(", "),
    petsAllowed: Boolean(house.rules?.petsAllowed),
    smokingAllowed: Boolean(house.rules?.smokingAllowed),
    status: house.status || "draft",
    startDate: toDateInput(firstRange?.startDate),
    endDate: toDateInput(firstRange?.endDate),
  };
}

export default function MyHouses() {
  const [houses, setHouses] = useState([]);
  const [photoDrafts, setPhotoDrafts] = useState({});
  const [newPhotoFiles, setNewPhotoFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [editDrafts, setEditDrafts] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createAttempted, setCreateAttempted] = useState(false);
  const [editAttemptedId, setEditAttemptedId] = useState("");
  const [amenitiesPicker, setAmenitiesPicker] = useState({
    open: false,
    mode: "create",
    houseId: "",
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    country: "",
    city: "",
    address: "",
    capacity: "",
    rooms: "",
    beds: "",
    baths: "",
    amenitiesText: "",
    petsAllowed: false,
    smokingAllowed: false,
    startDate: todayIso(),
    endDate: plusDaysIso(7),
    status: "draft",
    photos: [],
  });
  const createErrors = getValidationErrors(form, { requireDates: true });
  const createFlags = getValidationFlags(form, { requireDates: true });

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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function onEditChange(houseId, e) {
    const { name, value, type, checked } = e.target;
    setEditDrafts((prev) => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  }

  function startEdit(house) {
    setEditingId(house._id);
    setEditDrafts((prev) => ({
      ...prev,
      [house._id]: prev[house._id] || makeEditDraft(house),
    }));
  }

  function cancelEdit() {
    setEditingId("");
    setEditAttemptedId("");
  }

  function getSelectedAmenities() {
    if (amenitiesPicker.mode === "create")
      return parseAmenities(form.amenitiesText);
    const draft = editDrafts[amenitiesPicker.houseId];
    return parseAmenities(draft?.amenitiesText);
  }

  function toggleAmenity(amenity) {
    const selected = new Set(getSelectedAmenities());
    if (selected.has(amenity)) selected.delete(amenity);
    else selected.add(amenity);
    const next = Array.from(selected).slice(0, 20).join(", ");

    if (amenitiesPicker.mode === "create") {
      setForm((prev) => ({ ...prev, amenitiesText: next }));
      return;
    }

    setEditDrafts((prev) => ({
      ...prev,
      [amenitiesPicker.houseId]: {
        ...prev[amenitiesPicker.houseId],
        amenitiesText: next,
      },
    }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setCreateAttempted(true);
    if (createErrors.length > 0) return;

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
        capacity: Number(form.capacity || 1),
        rooms: Number(form.rooms || 0),
        beds: Number(form.beds || 0),
        baths: Number(form.baths || 0),
        amenities: parseAmenities(form.amenitiesText),
        rules: {
          petsAllowed: Boolean(form.petsAllowed),
          smokingAllowed: Boolean(form.smokingAllowed),
        },
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
      setCreateAttempted(false);
      setForm({
        title: "",
        description: "",
        country: "",
        city: "",
        address: "",
        capacity: "",
        rooms: "",
        beds: "",
        baths: "",
        amenitiesText: "",
        petsAllowed: false,
        smokingAllowed: false,
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

  async function saveEdit(houseId) {
    const draft = editDrafts[houseId];
    if (!draft) return;
    const editErrors = getValidationErrors(draft, { requireDates: false });
    setEditAttemptedId(houseId);
    if (editErrors.length > 0) return;

    setUpdatingId(houseId);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        location: {
          country: draft.country,
          city: draft.city,
          address: draft.address || undefined,
        },
        capacity: Number(draft.capacity),
        rooms: Number(draft.rooms || 0),
        beds: Number(draft.beds || 0),
        baths: Number(draft.baths || 0),
        amenities: parseAmenities(draft.amenitiesText),
        rules: {
          petsAllowed: Boolean(draft.petsAllowed),
          smokingAllowed: Boolean(draft.smokingAllowed),
        },
        status: draft.status,
      };

      if (draft.startDate && draft.endDate) {
        payload.availability = [
          {
            startDate: new Date(`${draft.startDate}T00:00:00`).toISOString(),
            endDate: new Date(`${draft.endDate}T00:00:00`).toISOString(),
          },
        ];
      }

      await updateHouse(houseId, payload);
      setMessage("Listing updated.");
      setEditingId("");
      setEditAttemptedId("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update listing");
    } finally {
      setUpdatingId("");
    }
  }

  async function setStatus(id, status) {
    setError("");
    setMessage("");
    try {
      await updateHouse(id, { status });
      setMessage(
        status === "published" ? "House published." : "House moved to draft.",
      );
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
    <div className="page">
      <h2 className="page-title">My Houses</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}
      {message ? <div className="text-success mb-sm">{message}</div> : null}
      {uploading ? (
        <div className="text-muted mb-sm">Uploading photos...</div>
      ) : null}

      <section className="panel section-gap">
        <h3 className="section-title">Create House</h3>
        <form onSubmit={onCreate} className="create-grid">
          {createAttempted && createErrors.length > 0 ? (
            <div className="span-full text-error">
              {createErrors.map((msg) => (
                <div key={msg}>{msg}</div>
              ))}
            </div>
          ) : null}
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={onChange}
            className={
              createAttempted && createFlags.title ? "field-invalid" : ""
            }
            required
          />
          <input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={onChange}
            className={
              createAttempted && createFlags.country ? "field-invalid" : ""
            }
            required
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={onChange}
            className={
              createAttempted && createFlags.city ? "field-invalid" : ""
            }
            required
          />
          <input
            name="address"
            placeholder="Address (optional)"
            value={form.address}
            onChange={onChange}
          />
          <input
            type="number"
            min={1}
            max={30}
            name="capacity"
            placeholder="Capacity (total guests)"
            title="Total number of guests the house can host (1-30)"
            value={form.capacity}
            onChange={onChange}
            className={
              createAttempted && createFlags.capacity ? "field-invalid" : ""
            }
            required
          />
          <input
            type="number"
            min={0}
            max={50}
            name="rooms"
            placeholder="Rooms (bedrooms)"
            title="Number of bedrooms (0-50)"
            value={form.rooms}
            onChange={onChange}
            className={
              createAttempted && createFlags.rooms ? "field-invalid" : ""
            }
          />
          <input
            type="number"
            min={0}
            max={50}
            name="beds"
            placeholder="Beds (total)"
            title="Total number of beds available (0-50)"
            value={form.beds}
            onChange={onChange}
            className={
              createAttempted && createFlags.beds ? "field-invalid" : ""
            }
          />
          <input
            type="number"
            min={0}
            max={50}
            name="baths"
            placeholder="Baths (bathrooms)"
            title="Number of bathrooms (0-50)"
            value={form.baths}
            onChange={onChange}
            className={
              createAttempted && createFlags.baths ? "field-invalid" : ""
            }
          />

          <select name="status" value={form.status} onChange={onChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <div>
            <button
              type="button"
              onClick={() =>
                setAmenitiesPicker({ open: true, mode: "create", houseId: "" })
              }
            >
              Choose Amenities
            </button>
            <div className="text-muted mt-xs">
              {form.amenitiesText || "No amenities selected"}
            </div>
          </div>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            className={
              createAttempted && createFlags.startDate ? "field-invalid" : ""
            }
            required
          />
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            className={
              createAttempted && createFlags.endDate ? "field-invalid" : ""
            }
            required
          />

          <div className="inline-checks span-full">
            <label className="check-chip">
              <input
                type="checkbox"
                name="petsAllowed"
                checked={form.petsAllowed}
                onChange={onChange}
              />{" "}
              Pets allowed
            </label>
            <label className="check-chip">
              <input
                type="checkbox"
                name="smokingAllowed"
                checked={form.smokingAllowed}
                onChange={onChange}
              />{" "}
              Smoking allowed
            </label>
          </div>

          <div className="span-full">
            <label className="input-label">Add Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addCreatePhotos(e.target.files)}
            />
            <div className="thumb-grid mt-sm">
              {form.photos.map((url, i) => (
                <div key={`create-photo-${i}`} className="thumb-wrap">
                  <img
                    src={url}
                    alt={`new photo ${i + 1}`}
                    className="thumb-image"
                  />
                  <button
                    type="button"
                    onClick={() => removeCreatePhoto(i)}
                    className="thumb-remove"
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
            className={`span-full ${
              createAttempted && createFlags.description ? "field-invalid" : ""
            }`}
            rows={3}
          />
          <div className="form-actions span-full">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create House"}
            </button>
          </div>
        </form>
      </section>

      <section className="section-gap">
        <h3 className="section-title">Your Listings</h3>
        {loading ? (
          <Loader label="Loading your listings..." />
        ) : houses.length === 0 ? (
          <EmptyState
            title="No listings yet"
            body="Create your first listing using the form above."
            actionLabel="Go To Create Form"
            actionOnClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          />
        ) : (
          <div className="stack-md">
            {houses.map((h) => {
              const draft = editDrafts[h._id] || makeEditDraft(h);
              const isEditing = editingId === h._id;
              const editErrors = getValidationErrors(draft, {
                requireDates: false,
              });
              const editFlags = getValidationFlags(draft, {
                requireDates: false,
              });
              const showEditValidation = editAttemptedId === h._id;
              return (
                <article key={h._id} className="card">
                  <div className="split-row">
                    <strong className="card-heading">{h.title}</strong>
                    <span className="text-muted">Status: {h.status}</span>
                  </div>
                  <div className="text-muted mt-xs">
                    {h.location?.city}, {h.location?.country} - Capacity{" "}
                    {h.capacity}
                  </div>

                  <div className="actions-row mt-sm">
                    <button
                      type="button"
                      onClick={() => (isEditing ? cancelEdit() : startEdit(h))}
                    >
                      {isEditing ? "Close Edit" : "Edit Listing"}
                    </button>
                    {h.status === "draft" ? (
                      <button onClick={() => setStatus(h._id, "published")}>
                        Publish
                      </button>
                    ) : null}
                    {h.status === "published" ? (
                      <button onClick={() => setStatus(h._id, "draft")}>
                        Move to Draft
                      </button>
                    ) : null}
                    <button
                      onClick={() => onDeleteHouse(h._id, h.title)}
                      disabled={deletingId === h._id}
                    >
                      {deletingId === h._id ? "Deleting..." : "Delete Listing"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="panel mt-sm">
                      <h4 className="section-title">Edit Details</h4>
                      {showEditValidation && editErrors.length > 0 ? (
                        <div className="text-error mb-sm">
                          {editErrors.map((msg) => (
                            <div key={msg}>{msg}</div>
                          ))}
                        </div>
                      ) : null}
                      <div className="create-grid">
                        <input
                          name="title"
                          value={draft.title}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.title
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          name="country"
                          value={draft.country}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.country
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          name="city"
                          value={draft.city}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.city
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          name="address"
                          value={draft.address}
                          onChange={(e) => onEditChange(h._id, e)}
                        />
                        <input
                          type="number"
                          min={1}
                          max={30}
                          name="capacity"
                          placeholder="Capacity (total guests)"
                          title="Total number of guests the house can host (1-30)"
                          value={draft.capacity}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.capacity
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          max={50}
                          name="rooms"
                          placeholder="Rooms (bedrooms)"
                          title="Number of bedrooms (0-50)"
                          value={draft.rooms}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.rooms
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          max={50}
                          name="beds"
                          placeholder="Beds (total)"
                          title="Total number of beds available (0-50)"
                          value={draft.beds}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.beds
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          max={50}
                          name="baths"
                          placeholder="Baths (bathrooms)"
                          title="Number of bathrooms (0-50)"
                          value={draft.baths}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.baths
                              ? "field-invalid"
                              : ""
                          }
                        />

                        <select
                          name="status"
                          value={draft.status}
                          onChange={(e) => onEditChange(h._id, e)}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setAmenitiesPicker({
                                open: true,
                                mode: "edit",
                                houseId: h._id,
                              })
                            }
                          >
                            Choose Amenities
                          </button>
                          <div className="text-muted mt-xs">
                            {draft.amenitiesText || "No amenities selected"}
                          </div>
                        </div>

                        <input
                          type="date"
                          name="startDate"
                          value={draft.startDate}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.startDate
                              ? "field-invalid"
                              : ""
                          }
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={draft.endDate}
                          onChange={(e) => onEditChange(h._id, e)}
                          className={
                            showEditValidation && editFlags.endDate
                              ? "field-invalid"
                              : ""
                          }
                        />

                        <div className="inline-checks span-full">
                          <label className="check-chip">
                            <input
                              type="checkbox"
                              name="petsAllowed"
                              checked={Boolean(draft.petsAllowed)}
                              onChange={(e) => onEditChange(h._id, e)}
                            />{" "}
                            Pets allowed
                          </label>
                          <label className="check-chip">
                            <input
                              type="checkbox"
                              name="smokingAllowed"
                              checked={Boolean(draft.smokingAllowed)}
                              onChange={(e) => onEditChange(h._id, e)}
                            />{" "}
                            Smoking allowed
                          </label>
                        </div>

                        <textarea
                          className={`span-full ${
                            showEditValidation && editFlags.description
                              ? "field-invalid"
                              : ""
                          }`}
                          rows={3}
                          name="description"
                          value={draft.description}
                          onChange={(e) => onEditChange(h._id, e)}
                        />
                      </div>
                      <div className="actions-row mt-sm form-actions">
                        <button
                          type="button"
                          onClick={() => saveEdit(h._id)}
                          disabled={updatingId === h._id}
                        >
                          {updatingId === h._id ? "Saving..." : "Save Edit"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-sm">
                    <strong>Photos</strong>
                    <div className="split-row mt-xs">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setNewPhotoFiles((prev) => ({
                            ...prev,
                            [h._id]: e.target.files,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addListingPhotos(h._id, newPhotoFiles[h._id])
                        }
                      >
                        Add Selected
                      </button>
                    </div>
                    <div className="thumb-grid mt-sm">
                      {(photoDrafts[h._id] || []).slice(0, 20).map((url, i) => (
                        <div key={`${h._id}-photo-${i}`} className="thumb-wrap">
                          <img
                            src={url}
                            alt={`${h.title} ${i + 1}`}
                            className="thumb-image"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.3";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeListingPhoto(h._id, i)}
                            className="thumb-remove"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="actions-row mt-sm">
                      <button onClick={() => savePhotos(h._id)}>
                        Save Photos
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {amenitiesPicker.open ? (
        <div
          className="modal-backdrop"
          onClick={() =>
            setAmenitiesPicker({ open: false, mode: "create", houseId: "" })
          }
        >
          <div
            className="panel modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="section-title">Choose Amenities</h4>
            <div className="create-grid">
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = getSelectedAmenities().includes(amenity);
                return (
                  <label key={amenity}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                    />{" "}
                    {amenity}
                  </label>
                );
              })}
            </div>
            <div className="actions-row mt-sm">
              <button
                type="button"
                onClick={() =>
                  setAmenitiesPicker({
                    open: false,
                    mode: "create",
                    houseId: "",
                  })
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
