import { api } from "../lib/api";
import { useEffect, useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import toast from "react-hot-toast";


import { CSS } from "@dnd-kit/utilities";



export default function Kanban() {
    const initialColumns = useMemo(
        () => [
          { id: "todo", title: "Pendiente" },
          { id: "doing", title: "En progreso" },
          { id: "done", title: "Hecho" },
        ],
        []
      );
      
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [newTitle, setNewTitle] = useState("");
      const [newDesc, setNewDesc] = useState("");
      const [newCol, setNewCol] = useState("todo");
      

  const [columns] = useState(initialColumns);

  const [cardsByColumn, setCardsByColumn] = useState({
    todo: [
      { id: "c1", title: "Diseñar layout", desc: "Sidebar + rutas" },
      { id: "c2", title: "Conectar backend", desc: "Endpoint /health" },
    ],
    doing: [{ id: "c3", title: "Kanban drag & drop", desc: "Mover tarjetas" }],
    done: [{ id: "c4", title: "Setup proyecto", desc: "Front y Back listos" }],
  });

  useEffect(() => {
    api.get("/cards")
      .then((res) => setCardsByColumn(res.data))
      .catch((err) => console.error("Error cargando tarjetas:", err));
  }, []);
  

  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function findColumnByCardId(cardId) {
    return Object.keys(cardsByColumn).find((colId) =>
      cardsByColumn[colId].some((c) => c.id === cardId)
    );
  }

  function onDragStart(event) {
    const { active } = event;
    const cardId = active.id;
    const colId = findColumnByCardId(cardId);
    if (!colId) return;
    const card = cardsByColumn[colId].find((c) => c.id === cardId);
    setActiveCard(card || null);
  }

  function onDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCol = findColumnByCardId(activeId);
    const overCol = columns.some((c) => c.id === overId)
      ? overId
      : findColumnByCardId(overId);

    if (!activeCol || !overCol) return;
    if (activeCol === overCol) return;

    setCardsByColumn((prev) => {
      const activeCardIndex = prev[activeCol].findIndex((c) => c.id === activeId);
      const card = prev[activeCol][activeCardIndex];

      const nextActiveColCards = prev[activeCol].filter((c) => c.id !== activeId);

      // Insertar al inicio del nuevo column
      const nextOverColCards = [card, ...(prev[overCol] || [])];

      return {
        ...prev,
        [activeCol]: nextActiveColCards,
        [overCol]: nextOverColCards,
      };
    });

    api.patch(`/cards/${activeId}/move`, {
      fromCol: activeCol,
      toCol: overCol,
    }).catch((err) => console.error("Error moviendo tarjeta:", err));
  }

  function onDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const colId = findColumnByCardId(activeId);
    if (!colId) return;

    // Si sueltas sobre una columna (vacía o header), no ordenamos
    if (columns.some((c) => c.id === overId)) return;

    const oldIndex = cardsByColumn[colId].findIndex((c) => c.id === activeId);
    const newIndex = cardsByColumn[colId].findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    if (oldIndex !== newIndex) {
      setCardsByColumn((prev) => ({
        ...prev,
        [colId]: arrayMove(prev[colId], oldIndex, newIndex),
      }));
    }
  }

  function createTask() {
    const title = newTitle.trim();
    if (!title) return;
  
  
    api.post("/cards", {
      title,
      desc: newDesc.trim(),
      columnId: newCol,
    })
      .then((res) => {
        setCardsByColumn(res.data.cardsByColumn);
        toast.success("Tarea creada ✅");

        setNewTitle("");
        setNewDesc("");
        setNewCol("todo");
        setIsModalOpen(false);
      })
      .catch((err) => {
        toast.error("No se pudo crear ❌");

      });
  }

  function onDelete(cardId) {
    if (!confirm("¿Eliminar esta tarea?")) return;
  
    api
      .delete(`/cards/${cardId}`)
      .then((res) => {
        setCardsByColumn(res.data.cardsByColumn);
        toast.success("Eliminada 🗑️");
      })
      .catch(() => toast.error("No se pudo eliminar ❌"));
  }
  
  
  function onEdit(card) {
    const title = prompt("Nuevo título:", card.title);
    if (title === null) return;
  
    const desc = prompt("Nueva descripción:", card.desc || "");
    if (desc === null) return;
  
    api
      .patch(`/cards/${card.id}`, { title, desc })
      .then((res) => {
        setCardsByColumn(res.data.cardsByColumn);
        toast.success("Actualizada ✏️");
      })
      .catch(() => toast.error("No se pudo actualizar ❌"));
  }
  
  

  return (
    <div>
      <h2 style={{ fontSize: 28, margin: 0 }}>Kanban</h2>
      <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
        Ya puedes arrastrar tarjetas entre columnas ✅
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
    
      <button
  onClick={() => setIsModalOpen(true)}
  style={{
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  + Nueva tarea
</button>


</div>


      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div style={board}>
          {columns.map((col) => (
            <Column
            key={col.id}
            column={col}
            cards={cardsByColumn[col.id] || []}
            onEdit={onEdit}
            onDelete={onDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <CardItem card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
  <div style={modalBackdrop} onClick={() => setIsModalOpen(false)}>
    <div style={modalBox} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Nueva tarea</h3>
      <p style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
        Escribe el título y elige dónde se crea.
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Título (obligatorio)"
          style={input}
        />
        <input
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          style={input}
        />

        <select value={newCol} onChange={(e) => setNewCol(e.target.value)} style={input}>
          <option value="todo">Pendiente</option>
          <option value="doing">En progreso</option>
          <option value="done">Hecho</option>
        </select>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setIsModalOpen(false)} style={btnGhost}>
            Cancelar
          </button>
          <button onClick={createTask} style={btnPrimary}>
            Crear
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}


  

function Column({ column, cards, onEdit, onDelete }) {
    // ✅ Esto hace que la columna sea “zona donde puedo soltar”
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
  
    return (
      <div
        ref={setNodeRef}
        style={{
          ...colStyle,
          outline: isOver ? "2px solid rgba(255,255,255,0.35)" : "none",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>{column.title}</div>
  
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "grid", gap: 10 }}>
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </SortableContext>
  
        {cards.length === 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            Suelta aquí…
          </div>
        )}
      </div>
    );
  }
  

function SortableCard({ card, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardItem card={card} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function CardItem({ card, overlay, onEdit, onDelete }) {
  return (
    <div
      style={{
        ...cardStyle,
        cursor: "grab",
        boxShadow: overlay ? "0 12px 30px rgba(0,0,0,0.45)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
  <div style={{ fontWeight: 700 }}>{card.title}</div>

  {!overlay && (
  <div style={{ display: "flex", gap: 8 }}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onEdit?.(card);
      }}
      style={miniBtn}
      title="Editar"
    >
      ✏️
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete?.(card.id);
      }}
      style={miniBtn}
      title="Eliminar"
    >
      🗑️
    </button>
  </div>
  )}
</div>

<div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
  {card.desc || "-"}
</div>

    </div>
  );
}

const board = {
  marginTop: 18,
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  alignItems: "start",
};

const colStyle = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  minHeight: 420,
};

const cardStyle = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const modalBox = {
  width: "100%",
  maxWidth: 460,
  borderRadius: 18,
  background: "#121217",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: 16,
};

const input = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
  cursor: "pointer",
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const miniBtn = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  borderRadius: 10,
  padding: "4px 8px",
  cursor: "pointer",
};
  