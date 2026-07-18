# 🧠 TechMind — Frontend

Dashboard interactivo de organización inteligente de contenido técnico.  
Construido con **React 19 + TypeScript + Vite**.

---

## 🚀 Cómo correr el proyecto

### Pre-requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18+ |
| pnpm | 8+ |

> Si no tienes `pnpm`: `npm install -g pnpm`

### Instalación y arranque

```bash
# 1. Entrar al directorio del frontend
cd front-end

# 2. Instalar dependencias
pnpm install

# 3. Levantar servidor de desarrollo (abre en http://localhost:5173)
pnpm dev
```

### Modo Demo (sin backend)

El frontend funciona **sin necesidad de que el backend esté corriendo**.  
Cuando la API falla (Connection Refused), automáticamente usa datos de ejemplo (`src/utils/mockData.ts`) para mostrar el dashboard completo.

---

## 📁 Estructura del proyecto

```
front-end/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx      # Sidebar + Topbar (wrapper de rutas)
│   │       └── Layout.css
│   ├── pages/
│   │   ├── Dashboard.tsx       # Métricas, gráficos, actividad reciente
│   │   ├── Analyze.tsx         # Formulario de análisis con IA
│   │   ├── History.tsx         # Historial de análisis con filtros
│   │   ├── Keywords.tsx        # Ranking y nube de palabras clave
│   │   └── *.css
│   ├── services/
│   │   └── api.ts              # Cliente HTTP + contentService
│   ├── utils/
│   │   ├── constants.ts        # Rutas, endpoints, colores por categoría
│   │   └── mockData.ts         # Datos de demo (fallback sin backend)
│   └── types/
│       └── index.ts            # Tipos TypeScript compartidos
├── vite.config.ts              # Proxy /api → localhost:8080
└── package.json
```

---

## 🔌 Integración con el Backend (Spring Boot)

### Proxy configurado

Todas las llamadas a `/api/*` se redirigen automáticamente al backend:

```
Frontend (localhost:5173) → /api/... → Backend (localhost:8080/api/...)
```

Configurado en `vite.config.ts`. En producción, configurar el reverse proxy (nginx / OCI Load Balancer) de la misma forma.

---

## 📡 Contrato de API esperado

### `POST /api/contenido` — Analizar contenido

**Request:**
```json
{
  "titulo": "Introducción a Spring Boot",
  "texto": "En este contenido se presentan los conceptos básicos para la creación de APIs REST utilizando Java y Spring Boot."
}
```

**Response esperada:**
```json
{
  "categoria": "Backend",
  "probabilidad": 0.89,
  "informacion_adicional": ["Java", "Spring Boot", "API REST"]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `categoria` | `string` | Categoría predicha por el modelo |
| `probabilidad` | `float` (0–1) | Confianza del modelo |
| `informacion_adicional` | `string[]` | Palabras clave extraídas |

---

### `GET /api/contenido/stats` — Estadísticas del dashboard

**Response esperada:**
```json
{
  "total_documentos": 1247,
  "categorias_activas": 10,
  "precision_promedio": 91.4,
  "documentos_hoy": 38
}
```

---

### `GET /api/contenido/categories` — Distribución por categoría

**Response esperada:**
```json
[
  {
    "categoria": "Backend",
    "count": 312,
    "porcentaje": 25.0
  },
  {
    "categoria": "Frontend",
    "count": 248,
    "porcentaje": 19.9
  }
]
```

---

### `GET /api/contenido/keywords?limit=20` — Top palabras clave

**Response esperada:**
```json
[
  { "keyword": "Spring Boot", "frecuencia": 198 },
  { "keyword": "React",       "frecuencia": 176 }
]
```

---

### `GET /api/contenido/history?page=0&size=20` — Historial de análisis

**Response esperada:**
```json
[
  {
    "id": "1",
    "titulo": "Introducción a Spring Boot y REST APIs",
    "categoria": "Backend",
    "probabilidad": 0.95,
    "timestamp": "2025-07-17T21:00:00Z"
  }
]
```

---

## 🏷️ Categorías soportadas

El frontend tiene colores y íconos predefinidos para estas categorías.  
El backend puede devolver cualquier string, pero estas tienen estilo visual:

| Categoría | Color |
|---|---|
| Backend | `#6366f1` (índigo) |
| Frontend | `#06b6d4` (cian) |
| DevOps | `#10b981` (verde) |
| Data Science | `#a855f7` (púrpura) |
| Cloud | `#3b82f6` (azul) |
| Base de Datos | `#14b8a6` (teal) |
| Seguridad | `#f59e0b` (ámbar) |
| Testing | `#f97316` (naranja) |
| Mobile | `#ec4899` (rosa) |
| Arquitectura | `#8b5cf6` (violeta) |

---

## 🛠️ Scripts disponibles

```bash
pnpm dev        # Servidor de desarrollo con HMR
pnpm build      # Build de producción (TypeScript + Vite)
pnpm preview    # Previsualizar el build de producción
pnpm lint       # Linter (oxlint)
```

## 📦 Dependencias principales

| Paquete | Versión | Uso |
|---|---|---|
| `react` | 19.x | Framework UI |
| `react-router-dom` | 7.x | Navegación SPA |
| `recharts` | 3.x | Gráficos (AreaChart, PieChart) |
| `lucide-react` | 1.x | Íconos |
| `typescript` | 6.x | Tipado estático |
| `vite` | 8.x | Build tool |
