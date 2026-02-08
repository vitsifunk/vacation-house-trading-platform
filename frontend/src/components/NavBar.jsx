import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, logout } from "../api/auth";
import { fetchUnreadCount } from "../api/notifications";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);
  const [messageUnread, setMessageUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await getMe();
        if (alive) {
          setMe(user);
          try {
            const count = await fetchUnreadCount();
            const messageCount = await fetchUnreadCount({
              type: "message_received",
            });
            if (alive) {
              setUnread(count);
              setMessageUnread(messageCount);
            }
          } catch {
            if (alive) {
              setUnread(0);
              setMessageUnread(0);
            }
          }
        }
      } catch {
        if (alive) {
          setMe(null);
          setUnread(0);
          setMessageUnread(0);
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
          <Link className="nav-brand" to="/houses">
            SwapHomes
          </Link>
          <NavLink className="nav-link" to="/houses">
            Houses
          </NavLink>
          {me ? (
            <NavLink className="nav-link" to="/my-houses">
              My Houses
            </NavLink>
          ) : null}
          {me ? (
            <NavLink className="nav-link" to="/swap-requests">
              Swap Requests
            </NavLink>
          ) : null}
          {me ? (
            <NavLink className="nav-link" to="/swaps">
              My Swaps
            </NavLink>
          ) : null}
          {me ? (
            <NavLink className="nav-link" to="/messages">
              Messages
              {messageUnread > 0 ? (
                <span className="count-pill">{messageUnread}</span>
              ) : null}
            </NavLink>
          ) : null}
          {me ? (
            <NavLink className="nav-link" to="/notifications">
              Notifications
              {unread > 0 ? <span className="count-pill">{unread}</span> : null}
            </NavLink>
          ) : null}
        </div>

        <div className="nav-right">
          {me ? (
            <>
              <NavLink className="nav-link" to="/profile">
                Profile
              </NavLink>
              <span className="nav-user">Hi, {me.name}</span>
              <button type="button" onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
              <NavLink className="nav-link" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
