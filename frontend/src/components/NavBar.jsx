import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
    <header className="navbar-wrap">
      <nav className="navbar">
        <div className="nav-left">
          <NavLink className="nav-brand" to="/houses">
            SwapNest
          </NavLink>
          <NavLink className="nav-link" to="/houses">
            Houses
          </NavLink>
          <NavLink className="nav-link" to="/my-houses">
            My Houses
          </NavLink>
          <NavLink className="nav-link" to="/swap-requests">
            Swap Requests
          </NavLink>
          <NavLink className="nav-link" to="/swaps">
            Accepted Swaps
          </NavLink>
        </div>
      {me ? (
        <NavLink className="nav-link" to="/notifications">
          Notifications{unread > 0 ? ` (${unread})` : ""}
        </NavLink>
      ) : null}
      {me ? <NavLink className="nav-link" to="/profile">Profile</NavLink> : null}

      <div className="nav-right">
        {me ? (
          <>
            <span className="nav-user">Hi, {me.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink className="nav-link" to="/login">Login</NavLink>
            <NavLink className="nav-link" to="/register">Register</NavLink>
          </>
        )}
      </div>
      </nav>
    </header>
  );
}
