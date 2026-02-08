import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../api/auth";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ status: "loading" }); // loading | authed | guest

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await getMe();
        if (alive) setState({ status: "authed" });
      } catch {
        if (alive) setState({ status: "guest" });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (state.status === "loading")
    return <div style={{ padding: 24 }}>Loading...</div>;
  if (state.status === "guest") return <Navigate to="/login" replace />;
  return children;
}
