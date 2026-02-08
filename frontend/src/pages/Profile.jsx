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

  if (loading) return <div className="page">Loading profile...</div>;

  return (
    <div className="page">
      <h2 className="page-title">My Profile</h2>
      {error ? <div className="text-error mb-sm">{error}</div> : null}
      {message ? <div className="text-success mb-sm">{message}</div> : null}

      <section className="panel section-gap profile-panel">
        <h3 className="section-title">Profile Details</h3>
        <form onSubmit={saveProfile} className="stack-sm">
          {form.avatarUrl ? (
            <div>
              <img
                src={form.avatarUrl}
                alt="Avatar preview"
                className="avatar-preview"
              />
            </div>
          ) : null}
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
            required
            minLength={2}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={onChange}
            autoComplete="address-level2"
          />
          <div className="split-row">
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
          {avatarFile ? (
            <div className="text-muted mt-xs">Selected: {avatarFile.name}</div>
          ) : null}
          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={onChange}
            maxLength={400}
            rows={4}
          />
          <div className="text-muted mt-xs">{form.bio.length}/400 characters</div>
          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="panel section-gap profile-panel">
        <h3 className="section-title">Change Password</h3>
        <form onSubmit={savePassword} className="stack-sm">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            value={pwd.currentPassword}
            onChange={onPwdChange}
            autoComplete="current-password"
            minLength={8}
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={pwd.newPassword}
            onChange={onPwdChange}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={pwd.confirmPassword}
            onChange={onPwdChange}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      <section className="panel profile-panel">
        <h3 className="section-title">Danger Zone</h3>
        <p className="text-muted mb-sm">
          Deactivating your account signs you out and moves your listings to draft.
        </p>
        <button
          type="button"
          onClick={deactivateAccount}
          className="danger-btn"
        >
          Deactivate Account
        </button>
      </section>
    </div>
  );
}
