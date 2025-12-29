# 🔥 Sexshop E-commerce

E-commerce completo para sexshop con React, Node.js, MongoDB y Docker.

## 🚀 Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (gestión de imágenes)
- Helmet, CORS, Rate Limiting

### Frontend
- React 18 + Vite + TypeScript
- React Router v6
- Tailwind CSS (tema negro/fucsia)
- Zustand (state management)
- Axios

### DevOps
- Docker + Docker Compose
- pnpm workspaces (monorepo)

## 📦 Estructura del Proyecto

```
sexshop-ecommerce/
├── packages/
│   ├── frontend/          # React app
│   ├── backend/           # Express API
│   └── shared/            # Tipos compartidos
├── docker/                # Dockerfiles y compose
└── package.json           # Workspace root
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js >= 18
- pnpm >= 8
- Docker y Docker Compose (opcional)

### Desarrollo Local

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno:
```bash
cp packages/backend/.env.example packages/backend/.env
# Editar .env con tus credenciales
```

3. Iniciar desarrollo:
```bash
pnpm dev
```

Esto iniciará:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 🐳 Docker

```bash
docker-compose up
```

## 📝 Scripts Disponibles

- `pnpm dev` - Inicia frontend y backend en modo desarrollo
- `pnpm build` - Build de producción
- `pnpm lint` - Ejecuta ESLint
- `pnpm format` - Formatea código con Prettier

## 🔑 Funcionalidades

### Usuario
- ✅ Registro y autenticación
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras
- ✅ Gestión de órdenes
- ✅ Perfil de usuario

### Admin
- ✅ Panel de administración
- ✅ CRUD de productos
- ✅ Upload de imágenes
- ✅ Gestión de categorías
- ✅ Visualización de órdenes

## 📄 Licencia

MIT
