import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Houses from "./pages/Houses";
import HouseDetails from "./pages/HouseDetails";
import Swaps from "./pages/Swaps";
import Chat from "./pages/Chat";
import MyHouses from "./pages/MyHouses";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <>
      <NavBar />

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
        <Route
          path="/houses/:id"
          element={
            <ProtectedRoute>
              <HouseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-houses"
          element={
            <ProtectedRoute>
              <MyHouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/swaps"
          element={
            <ProtectedRoute>
              <Swaps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/swaps/:id/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
