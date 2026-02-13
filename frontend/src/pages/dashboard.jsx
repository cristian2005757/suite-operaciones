import { api } from "../lib/api";
import { useEffect, useMemo, useState } from "react";

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const grid = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
};

const card = {
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const th = {
  fontSize: 12,
  color: "rgba(255,255,255,0.65)",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
};

const td = {
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  verticalAlign: "top",
};

const badge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 12,
};

const inputControl = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.20)",
  color: "white",
  outline: "none",
  minWidth: 220,
};
  
  

export default function Dashboard() {
  const [cardsByColumn, setCardsByColumn] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.get("/cards")
      .then((res) => setCardsByColumn(res.data))
      .catch((err) => console.error("Error cargando tarjetas:", err));
  }, []);

  const kpis = useMemo(() => {
    if (!cardsByColumn) return { total: 0, todo: 0, doing: 0, done: 0 };

    const todo = cardsByColumn.todo?.length ?? 0;
    const doing = cardsByColumn.doing?.length ?? 0;
    const done = cardsByColumn.done?.length ?? 0;

    return { total: todo + doing + done, todo, doing, done };
  }, [cardsByColumn]);

  const progress = kpis.total ? Math.round((kpis.done / kpis.total) * 100) : 0;

  const tasks = useMemo(() => {
    if (!cardsByColumn) return [];

    const mapColName = {
      todo: "Pendiente",
      doing: "En progreso",
      done: "Hecho",
    };

    return Object.entries(cardsByColumn).flatMap(([colId, cards]) =>
      (cards || []).map((c) => ({
        ...c,
        columnId: colId,
        columnName: mapColName[colId] || colId,
      }))
    );
  }, [cardsByColumn]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesText =
        !q ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.desc || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : t.columnId === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [tasks, query, statusFilter]);
  

  return (
    <div>
      <h2 style={{ fontSize: 28, margin: 0 }}>Dashboard</h2>
      <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
        KPIs en tiempo real desde el backend ✅
      </p>

      <div style={grid}>
        <Card title="Tareas totales" value={kpis.total} />
        <Card title="Pendientes" value={kpis.todo} />
        <Card title="En progreso" value={kpis.doing} />
        <Card title="Hechas" value={kpis.done} />
      </div>

      <div style={{ marginTop: 18, ...card }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ fontWeight: 800 }}>Últimas tareas</div>
    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
      {filteredTasks.length} encontradas
    </div>
  </div>

  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Buscar por título o descripción..."
    style={inputControl}
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={inputControl}
  >
    <option value="all">Todos</option>
    <option value="todo">Pendiente</option>
    <option value="doing">En progreso</option>
    <option value="done">Hecho</option>
  </select>
</div>


  <div style={{ marginTop: 12, overflow: "auto" }}>
    {tasks.length === 0 ? (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        No hay tareas todavía
      </div>
    ) : filteredTasks.length === 0 ? (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        No hay coincidencias con los filtros
      </div>
    ) : (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={th}>Título</th>
            <th style={th}>Estado</th>
            <th style={th}>Descripción</th>
          </tr>
        </thead>
        <tbody>
        {filteredTasks.slice(0, 8).map((t) => (
            <tr key={t.id}>
              <td style={td}>{t.title}</td>
              <td style={td}>
                <span style={badge}>{t.columnName}</span>
              </td>
              <td style={td}>{t.desc || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>


      <div style={{ marginTop: 18, ...card }}>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
          Progreso general
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
          {progress}%
        </div>

        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            marginTop: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.65)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
