# Suite Operaciones (Dashboard + Kanban)

Aplicación fullstack para gestión de tareas tipo Trello, con Dashboard de KPIs en tiempo real y autenticación JWT.

## Preview
![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![Kanban](docs/screenshots/kanban.png)

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
API: http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

### Credenciales demo
- **Email:** admin@demo.com
- **Password:** 1234

## Tecnologías
- **Frontend:** React + Vite, Axios
- **UI:** estilos inline (dark UI)
- **Drag & Drop:** dnd-kit
- **Backend:** Node.js + Express
- **Auth:** JWT