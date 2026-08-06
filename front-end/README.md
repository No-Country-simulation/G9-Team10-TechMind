# TechMind — Frontend

Plataforma web para organización inteligente del conocimiento técnico.  
Construido con **React 19 + TypeScript + Vite**.

---

## Inicio rápido

### Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18+ |
| pnpm | 8+ |

```bash
npm install -g pnpm   # si no lo tienes instalado
```

### Instalación y arranque

```bash
cd front-end
pnpm install
pnpm dev
```

La app abre en **http://localhost:5173** y redirige automáticamente a `/inicio`.

### Build de producción

```bash
pnpm build
pnpm preview
```

---

## Modo de uso

### 1. Navegación general

El menú lateral izquierdo es el punto de entrada principal:

| Sección | Ruta | Descripción |
|---|---|---|
| **Inicio** | `/inicio` | Pantalla de bienvenida con búsqueda, categorías y recomendaciones |
| **Búsqueda** | `/busqueda` | Resultados con filtros por nivel, categoría e idioma |
| **Biblioteca** | `/biblioteca` | Tabla con todos los documentos analizados |
| **Recomendaciones** | `/recomendaciones` | Contenido sugerido por IA |
| **Mis documentos** | `/mis-documentos` | Documentos del usuario en formato de tarjetas |
| **Dashboard** | `/dashboard` | Métricas, gráficos y actividad reciente |
| **Configuración** | `/configuracion` | Tema, idioma, perfil y preferencias |

En la parte inferior del menú aparece el perfil del usuario con acceso directo a configuración.

---

### 2. Inicio (`/inicio`)

1. Escribe en la barra de búsqueda qué tecnología quieres aprender.
2. Pulsa **Buscar** para ir a la página de resultados.
3. Explora el grid **Explora por categorías** (Backend, Frontend, DevOps, etc.).
4. Revisa **Documentos recientes** y **Recomendaciones para ti**.

---

### 3. Búsqueda (`/busqueda`)

1. Usa la barra superior para buscar por título, descripción o keywords.
2. Abre **Filtros** para refinar por:
   - **Nivel:** Principiante, Intermedio, Avanzado
   - **Categoría:** Backend, Frontend, Data Science, etc.
   - **Idioma:** Español, Inglés, Portugués
3. Cada resultado muestra categoría, tags, tiempo de lectura y, si está activo en configuración, el **% de similitud**.
4. Los documentos marcados con **Recomendado por IA** tienen badge púrpura.

---

### 4. Analizar contenido (`/analyze`)

Accede desde **Biblioteca** o **Mis documentos** con los botones **Nuevo documento** / **Importar documento**.

1. Ingresa el **título** del contenido técnico.
2. Pega el **texto o descripción** (máx. 2000 caracteres).
3. Pulsa **Analizar con IA**.
4. El panel derecho muestra:
   - Categoría detectada
   - Confianza del modelo (%)
   - Palabras clave
   - Nivel de dificultad (si el backend lo devuelve)
   - Vista JSON opcional

También puedes usar los **ejemplos rápidos** para probar sin escribir contenido.

---

### 5. Biblioteca (`/biblioteca`)

Gestiona el corpus completo de documentos:

- **Buscar** por título, categoría o keyword
- **Filtrar** por categoría con el selector desplegable
- **Ordenar** por mayor o menor precisión
- **Actualizar** la lista desde el backend
- **Eliminar** documentos con el icono de papelera

Columnas: Título, Categoría, Idioma, Nivel, Precisión y Acciones.

---

### 6. Dashboard (`/dashboard`)

Vista de métricas del sistema:

- Tarjetas: Total documentos, Idiomas detectados, Categorías, Embeddings generados
- Gráfico de documentos procesados (últimos 7 días)
- Distribución por categoría (donut + barras)
- Actividad reciente y top keywords

Si el backend no está disponible, muestra un banner **Modo Demo** con datos de ejemplo.

---

### 7. Configuración (`/configuracion`)

Las preferencias se guardan en el navegador (`localStorage`) y persisten al recargar.

#### General
| Ajuste | Comportamiento |
|---|---|
| **Tema Claro / Oscuro** | Se aplica al instante en toda la app |
| **Idioma** | ES / EN / PT — traduce el menú lateral al guardar |

#### Perfil
- Edita **nombre** y **email**
- Al guardar, el sidebar muestra el nombre e iniciales actualizados

#### Preferencias
| Opción | Efecto |
|---|---|
| Mostrar similitud | Muestra u oculta el badge `% similitud` en búsqueda |
| Vista compacta | Reduce el espaciado de la tabla en Biblioteca |
| Idioma predeterminado | Preferencia para documentos nuevos |

#### Notificaciones
- Resumen semanal por email
- Alertas de recomendaciones
- Aviso al completar un análisis

**Guardar cambios** persiste todo. **Descartar cambios** revierte al último estado guardado.

---

## Modo Demo vs. Modo conectado

| Situación | Comportamiento |
|---|---|
| Backend **apagado** | La app funciona con datos mock; banner amarillo de demo en Dashboard/Biblioteca |
| Backend **encendido** (`localhost:8080`) | Datos reales desde la API Spring Boot |
| Análisis sin backend | Genera resultado demo local tras ~1 s |

Para usar datos reales:

```bash
# Terminal 1 — Backend
cd back-end
./mvnw spring-boot:run

# Terminal 2 — Frontend
cd front-end
pnpm dev
```

El proxy de Vite redirige `/api/*` → `http://localhost:8080`.

---

## Rutas adicionales

| Ruta | Uso |
|---|---|
| `/keywords` | Ranking y nube de palabras clave (acceso directo por URL) |
| `/history` | Redirige a `/biblioteca` |

---

## Estructura del proyecto

```
front-end/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar + shell principal
│   │   └── ui/              # DocumentCard, CategoryIcon
│   ├── context/
│   │   └── SettingsContext.tsx   # Tema, idioma, perfil (localStorage)
│   ├── pages/
│   │   ├── Home.tsx         # Inicio
│   │   ├── Search.tsx       # Búsqueda
│   │   ├── History.tsx      # Biblioteca
│   │   ├── Dashboard.tsx    # Métricas
│   │   ├── Analyze.tsx      # Análisis con IA
│   │   ├── Settings.tsx     # Configuración
│   │   └── ...
│   ├── services/api.ts      # Cliente HTTP
│   ├── utils/
│   │   ├── constants.ts     # Rutas, colores, endpoints
│   │   ├── i18n.ts          # Traducciones ES/EN/PT
│   │   └── mockData.ts      # Datos de demo
│   └── index.css            # Design system + tema oscuro
├── vite.config.ts           # Proxy /api → localhost:8080
└── package.json
```

---

## Scripts disponibles

```bash
pnpm dev        # Servidor de desarrollo (HMR)
pnpm build      # Build de producción
pnpm preview    # Previsualizar build
pnpm lint       # Linter (oxlint)
```

---

## Categorías soportadas

| Categoría | Color |
|---|---|
| Backend | `#2563EB` |
| Frontend | `#08BBD4` |
| DevOps | `#22C55E` |
| Data Science | `#7C3AED` |
| Cloud | `#3B82F6` |
| Base de Datos | `#14B8A6` |
| Seguridad | `#F59E0B` |
| Testing | `#F97316` |
| Mobile | `#EC4899` |
| Arquitectura | `#8B5CF6` |

---

## Dependencias principales

| Paquete | Uso |
|---|---|
| `react` 19 | Framework UI |
| `react-router-dom` 7 | Navegación SPA |
| `recharts` 3 | Gráficos del dashboard |
| `lucide-react` | Iconos |
| `vite` 8 | Build tool |
