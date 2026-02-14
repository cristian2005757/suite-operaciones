# Suite Operaciones (Dashboard + Kanban)

Aplicación fullstack para gestión de tareas tipo Trello, con Dashboard de KPIs en tiempo real y autenticación JWT.

## Preview
![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![Kanban](docs/screenshots/kanban.png)

## 🔗 Demo en vivo
- **Frontend (Vercel):** https://suite-operaciones.vercel.app
- **Backend API (Render):** https://suite-operaciones.onrender.com
  - *Nota: la raíz `/` puede responder `Cannot GET /` (normal). Usa `/health` para verificar estado.*
- **Health check:** https://suite-operaciones.onrender.com/health

### ¿Dónde está desplegado? (en simple)
- **Frontend → Vercel:** la interfaz (React) que ves en el navegador.
- **Backend → Render:** la API (Node + Express) que guarda las tareas en `data.json`.

En resumen: el usuario visita Vercel, y Vercel llama a Render para los datos.

## 🧱 Arquitectura (mini)
**Flujo:** Frontend (Vercel) → Axios → Backend API (Render) → JWT → Rutas protegidas

- El frontend guarda el token en `localStorage`.
- En cada request, Axios agrega: `Authorization: Bearer <token>`.
- Si la API responde `401`, se borra el token y se redirige a `/login`.

```
┌─────────────────────┐     HTTP + Bearer token      ┌─────────────────────┐
│  Frontend (Vercel)   │ ──────────────────────────►  │  Backend (Render)   │
│  React + Vite       │                              │  Node + Express     │
│  • UI / rutas       │ ◄──────────────────────────  │  • Valida JWT       │
│  • Axios + token    │     JSON                     │  • CRUD tarjetas    │
└─────────────────────┘                              └──────────┬──────────┘
                                                                 │
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │  data.json          │
                                                      │  (persistencia)     │
                                                      └─────────────────────┘
```

| Capa | Tecnología | Función |
|------|------------|---------|
| **Frontend** | React + Vite (Vercel) | UI, rutas protegidas, envía token en cada request |
| **HTTP** | Axios | Cliente API con interceptor `Authorization: Bearer <token>` |
| **Backend** | Node + Express (Render) | Valida JWT, expone endpoints REST |
| **Persistencia** | `data.json` | Almacenamiento de tareas (demo, sin BD) |

### Flujo de autenticación
1. Usuario ingresa credenciales en `/login`.
2. `POST /auth/login` → backend valida y retorna **JWT**.
3. Frontend guarda el token en `localStorage` y lo adjunta en todas las peticiones.
4. Si la API responde `401` (token inválido/expirado) → el frontend borra el token y redirige a `/login`.

## 🔌 Endpoints clave (Backend)
- `GET /health` → estado del backend
- `POST /auth/login` → devuelve JWT (demo: `admin@demo.com` / `1234`)
- `GET /cards` → listar tarjetas (protegido)
- `POST /cards` → crear tarjeta (protegido)
- `PATCH /cards/:id` → editar tarjeta (protegido)
- `PATCH /cards/:id/move` → mover tarjeta de columna (protegido)
- `DELETE /cards/:id` → eliminar tarjeta (protegido)

---

## Funcionalidades
- ✅ Login / Logout con JWT
- ✅ Rutas protegidas (si no hay token → /login)
- ✅ Kanban drag & drop (Pendiente / En progreso / Hecho)
- ✅ CRUD de tareas (crear, editar, eliminar)
- ✅ Persistencia en backend (API)
- ✅ Dashboard con KPIs + tabla de últimas tareas + barra de progreso

## Flujo de uso
1. Abrir la app → redirección a `/login` si no hay token.
2. Login con `admin@demo.com` / `1234`.
3. Redirección a `/dashboard`.
4. Dashboard y Kanban consumen la API enviando `Authorization: Bearer <token>`.
5. Token inválido/expirado → `401` → redirección a `/login`.
6. “Salir” borra el token y redirige a `/login`.

## Instalación (local)

### Requisitos
- Node.js 18+ recomendado

### Backend
```bash
cd backend
npm install
npm run dev
```
**Local API:** http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**Local Front:** http://localhost:5173

### Variables de entorno (Frontend)
Crea un archivo `frontend/.env`:

```
VITE_API_URL=http://localhost:3001
```

En producción (Vercel) ya está configurado `VITE_API_URL=https://suite-operaciones.onrender.com`.

### Credenciales demo
- **Email:** admin@demo.com
- **Password:** 1234

## Tecnologías
- **Frontend:** React + Vite, Axios
- **UI:** estilos inline (dark UI)
- **Drag & Drop:** dnd-kit
- **Backend:** Node.js + Express
- **Auth:** JWT