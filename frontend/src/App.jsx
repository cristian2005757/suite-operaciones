import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/applayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Kanban from "./pages/kanban";
import Login from "./pages/login";
import { Toaster } from "react-hot-toast";


export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Kanban />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-right" />

    </BrowserRouter>
  );
}
