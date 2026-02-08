import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteMe,
  fetchMeProfile,
  updateMeProfile,
  updateMyPassword,
} from "../api/users";
import { uploadImageFile } from "../api/uploads";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    avatarUrl: "",
  });
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await fetchMeProfile();
        if (!alive) return;
        setForm({
          name: user?.name || "",
          bio: user?.bio || "",
          location: user?.location || "",
          avatarUrl: user?.avatarUrl || "",
        });
      } catch {
        if (alive) setError("Failed to load profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function onPwdChange(e) {
    setPwd((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      await updateMeProfile(form);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError("");
    setMessage("");
    try {
      const url = await uploadImageFile(avatarFile);
      setForm((prev) => ({ ...prev, avatarUrl: url || "" }));
      setMessage("Avatar uploaded. Click Save Profile to persist changes.");
      setAvatarFile(null);
    } catch {
      setError("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setSavingPassword(true);
    setError("");
    setMessage("");
    try {
      await updateMyPassword(pwd);
      setMessage("Password updated.");
      setPwd({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function deactivateAccount() {
    const ok = window.confirm(
      "Deactivate your account? Your listings will be moved to draft.",
    );
    if (!ok) return;

    setError("");
    setMessage("");
    try {
      await deleteMe();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate account.");
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading profile...</div>;

  return (
    <div style={{ padding: 24, color: "#222" }}>
      <h2>My Profile</h2>
      {error ? <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div> : null}
      {message ? <div style={{ color: "green", marginBottom: 10 }}>{message}</div> : null}

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 14,
          marginBottom: 16,
          maxWidth: 680,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Profile Details</h3>
        <form onSubmit={saveProfile} style={{ display: "grid", gap: 10 }}>
          {form.avatarUrl ? (
            <div>
              <img
                src={form.avatarUrl}
                alt="Avatar preview"
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          ) : null}
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            required
            minLength={2}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={onChange}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={uploadAvatar}
              disabled={!avatarFile || uploadingAvatar}
            >
              {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
            </button>
          </div>
          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={onChange}
            maxLength={400}
            rows={4}
          />
          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 14,
          marginBottom: 16,
          maxWidth: 680,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Change Password</h3>
        <form onSubmit={savePassword} style={{ display: "grid", gap: 10 }}>
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            value={pwd.currentPassword}
            onChange={onPwdChange}
            minLength={8}
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={pwd.newPassword}
            onChange={onPwdChange}
            minLength={8}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={pwd.confirmPassword}
            onChange={onPwdChange}
            minLength={8}
            required
          />
          <button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      <section style={{ maxWidth: 680 }}>
        <button
          onClick={deactivateAccount}
          style={{ background: "#b00020", color: "white", border: "none", padding: "8px 12px" }}
        >
          Deactivate Account
        </button>
      </section>
    </div>
  );
}
