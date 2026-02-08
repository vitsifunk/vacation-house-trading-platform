import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Houses from "./pages/Houses";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/houses" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/houses"
        element={
          <ProtectedRoute>
            <Houses />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
