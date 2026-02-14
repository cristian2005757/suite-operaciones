import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (!data.cardsByColumn) data.cardsByColumn = { todo: [], doing: [], done: [] };
    return data;
  } catch (err) {
    console.error("Error leyendo data.json:", err.message);
    return { cardsByColumn: { todo: [], doing: [], done: [] } };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
    if (!token) return res.status(401).json({ ok: false, message: "No token" });
  
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (e) {
      return res.status(401).json({ ok: false, message: "Token inválido" });
    }
  }
  

app.get("/health", (req, res) => res.json({ ok: true, message: "Backend running" }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ ok: false, message: "JWT_SECRET no configurado" });
  }

  // Usuario demo (para portafolio)
  if (email !== "admin@demo.com" || password !== "1234") {
    return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
  }

  const token = jwt.sign({ email }, secret, { expiresIn: "1d" });
  res.json({ ok: true, token });
});
  
// ✅ Traer tarjetas
app.get("/cards", auth, (req, res) => {
  const data = readData();
  res.json(data.cardsByColumn);
});

// ✅ Crear tarjeta
app.post("/cards", auth, (req, res) => {
  const { title, desc = "", columnId = "todo" } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ ok: false, error: "title required" });

  const data = readData();
  const id = `c${Date.now()}`;
  const card = { id, title: title.trim(), desc: desc.trim() };

  if (!data.cardsByColumn[columnId]) data.cardsByColumn[columnId] = [];
  data.cardsByColumn[columnId].unshift(card);

  writeData(data);
  res.json({ ok: true, card, cardsByColumn: data.cardsByColumn });
});

// ✅ Mover tarjeta (guardar cambio de columna)
app.patch("/cards/:id/move", auth, (req, res) => {
  const { id } = req.params;
  const { fromCol, toCol } = req.body || {};

  if (!fromCol || !toCol) return res.status(400).json({ ok: false, error: "fromCol and toCol required" });

  const data = readData();
  const fromList = data.cardsByColumn[fromCol] || [];
  const toList = data.cardsByColumn[toCol] || [];

  const idx = fromList.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "card not found in fromCol" });

  const [card] = fromList.splice(idx, 1);
  toList.unshift(card);

  data.cardsByColumn[fromCol] = fromList;
  data.cardsByColumn[toCol] = toList;

  writeData(data);
  res.json({ ok: true, cardsByColumn: data.cardsByColumn });
});

// ✅ Editar tarjeta
app.patch("/cards/:id", auth, (req, res) => {
  const { id } = req.params;
  const { title, desc } = req.body || {};

  const data = readData();
  const cardsByColumn = data.cardsByColumn || {};
  let found = false;

  for (const colId of Object.keys(cardsByColumn)) {
    const colCards = cardsByColumn[colId];
    if (!Array.isArray(colCards)) continue;
    const idx = colCards.findIndex((c) => c.id === id);
    if (idx !== -1) {
      cardsByColumn[colId][idx] = {
        ...cardsByColumn[colId][idx],
        title: title ?? cardsByColumn[colId][idx].title,
        desc: desc ?? cardsByColumn[colId][idx].desc,
      };
      found = true;
      break;
    }
  }

  if (!found) return res.status(404).json({ ok: false, message: "Card not found" });

  writeData(data);
  res.json({ ok: true, cardsByColumn: data.cardsByColumn });
});

// ✅ Eliminar tarjeta
app.delete("/cards/:id", auth, (req, res) => {
  const { id } = req.params;

  const data = readData();
  const cardsByColumn = data.cardsByColumn || {};
  let removed = false;

  for (const colId of Object.keys(cardsByColumn)) {
    const colCards = cardsByColumn[colId];
    if (!Array.isArray(colCards)) continue;
    const before = colCards.length;
    cardsByColumn[colId] = colCards.filter((c) => c.id !== id);
    if (cardsByColumn[colId].length !== before) removed = true;
  }

  if (!removed) return res.status(404).json({ ok: false, message: "Card not found" });

  writeData(data);
  res.json({ ok: true, cardsByColumn: data.cardsByColumn });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));