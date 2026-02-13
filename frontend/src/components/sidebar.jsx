import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition hover:bg-white/10";
const active = "bg-white/10 text-white";
const inactive = "text-white/70";

export default function Sidebar() {
  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>
        <div style={styles.logo}>SO</div>
        <div>
          <div style={styles.title}>Suite Operaciones</div>
          <div style={styles.sub}>Dashboard + Kanban</div>
        </div>
      </div>

      <nav style={{ marginTop: 16, display: "grid", gap: 6 }}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          📊 <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/kanban"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          🧩 <span>Kanban</span>
        </NavLink>

        <NavLink
          to="/login"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          🔐 <span>Login</span>
        </NavLink>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className={`${base} ${inactive}`}
          style={{
            width: "100%",
            textAlign: "left",
            border: "none",
            background: "transparent",
            font: "inherit",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          🚪 <span>Salir</span>
        </button>
      </nav>
    </aside>
  );
}

const styles = {
  aside: {
    width: 260,
    minHeight: "100vh",
    padding: 16,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.25)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "white",
    fontWeight: 700,
  },
  title: { color: "white", fontWeight: 700 },
  sub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
};
