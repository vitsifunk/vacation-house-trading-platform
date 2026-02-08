import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, logout } from "../api/auth";
import { fetchUnreadCount } from "../api/notifications";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await getMe();
        if (alive) {
          setMe(user);
          try {
            const count = await fetchUnreadCount();
            if (alive) setUnread(count);
          } catch {
            if (alive) setUnread(0);
          }
        }
      } catch {
        if (alive) {
          setMe(null);
          setUnread(0);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setMe(null);
      navigate("/login", { replace: true });
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <Link to="/houses">Houses</Link>
      <Link to="/my-houses">My Houses</Link>
      <Link to="/swaps">My Swaps</Link>
      {me ? (
        <Link to="/notifications">
          Notifications{unread > 0 ? ` (${unread})` : ""}
        </Link>
      ) : null}
      {me ? <Link to="/profile">Profile</Link> : null}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {me ? (
          <>
            <span style={{ opacity: 0.8 }}>Hi, {me.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
