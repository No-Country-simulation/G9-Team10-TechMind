# 🧠 TechMind — Organización Inteligente de Conocimiento

> **Hackathon ONE G9 LATAM — Team 10**

Plataforma de organización inteligente de contenido técnico usando Ciencia de Datos e IA.  
Recibe textos técnicos y los clasifica, extrae palabras clave y los agrupa automáticamente.

---

## 👥 Equipo

| Nombre | Rol |
|---|---|
| **Lainus Quisbert** | Backend Developer |
| **Rodrigo Munoz** | Data Scientist |
| **Juan Manuel Rios** | Backend Developer |
| **Maximiliano Rodriguez** | Data Scientist |
| **Alexis Hinojosa Lopez** | Frontend Developer |
| **Nairobi Betancourt** | Data Analyst |
| **Ruben Martinez de Marigorta** | Conversational Designer |
| **Valentina Parra** | Software Engineer |

---

## 🏗️ Arquitectura del Proyecto

```
G9-Team10-TechMind/
├── front-end/     # React 19 + TypeScript + Vite  (puerto 5173)
├── back-end/      # Spring Boot API REST           (puerto 8080)
└── Data/          # Jupyter Notebooks + modelos   (Python / scikit-learn)
```

---

## 🚀 Cómo correr el proyecto completo

### Frontend (React)
```bash
cd front-end
pnpm install
pnpm dev          # → http://localhost:5173
```
> Funciona en **modo demo** sin backend. Ver `front-end/README.md` para más detalle.

### Backend (Spring Boot)
```bash
cd back-end
./mvnw spring-boot:run   # → http://localhost:8080
```

### Data Science (Jupyter)
```bash
cd Data
pip install -r requirements.txt
jupyter notebook
```

---

## 📡 Contrato de Datos (Frontend ↔ Backend)

> ⚠️ **Este es el contrato acordado.** El Frontend espera exactamente esta estructura.  
> Cambios deben coordinarse con el equipo de Frontend.

### `POST /api/contenido`

**Request:**
```json
{
  "titulo": "string",
  "texto":  "string"
}
```

**Response:**
```json
{
  "categoria":             "string",
  "probabilidad":          0.89,
  "informacion_adicional": ["keyword1", "keyword2"]
}
```

---

### `GET /api/contenido/stats`
```json
{
  "total_documentos":   1247,
  "categorias_activas": 10,
  "precision_promedio": 91.4,
  "documentos_hoy":     38
}
```

---

### `GET /api/contenido/categories`
```json
[
  { "categoria": "Backend", "count": 312, "porcentaje": 25.0 }
]
```

---

### `GET /api/contenido/keywords?limit=20`
```json
[
  { "keyword": "Spring Boot", "frecuencia": 198 }
]
```

---

### `GET /api/contenido/history?page=0&size=20`
```json
[
  {
    "id":           "string",
    "titulo":       "string",
    "categoria":    "string",
    "probabilidad": 0.95,
    "timestamp":    "2025-07-17T21:00:00Z"
  }
]
```

---

## 🏷️ Categorías del modelo

El modelo debe devolver **exactamente** uno de estos valores en el campo `categoria`:

`Backend` · `Frontend` · `DevOps` · `Data Science` · `Cloud` · `Base de Datos` · `Seguridad` · `Testing` · `Mobile` · `Arquitectura` · `Otro`

---

## 🔗 Integración con OCI

| Recurso | Uso sugerido |
|---|---|
| **Object Storage** | Almacenar modelos `.pkl` / `.joblib` |
| **OCI Compute** | Hospedar backend Spring Boot |
| **OCI Functions** | Procesamiento específico de modelos |
| **Autonomous DB** | Persistencia de historial de análisis |

---

## 📋 Estado del Proyecto

- [x] Estructura del repositorio
- [x] Frontend — Dashboard completo (demo mode)
- [x] Frontend — Página Analizar con fallback mock
- [x] Frontend — Historial y Keywords
- [ ] Backend — API REST Spring Boot
- [ ] Data Science — Modelo entrenado
- [ ] Integración Frontend ↔ Backend
- [ ] Integración con OCI

---

*¡Cualquier sugerencia o edición a este documento es bienvenida!*

## 🎯 Objetivos y Enfoques (En Discusión)
La Hackathon nos permite explorar enfoques creativos. Algunas ideas sobre la mesa para discutir en nuestra primera reunión:
*   Usar herramientas de Inteligencia Artificial (Machine Learning o LLMs) para analizar el texto.
*   Crear una API que reciba el texto y devuelva los resultados estructurados (JSON).
*   Armar una interfaz sencilla para probar nuestra solución.
*   Conectar el proyecto a los servicios de nube de Oracle (OCI).

---

## 👥 Propuesta de División de Áreas
Para poder trabajar en paralelo y avanzar rápido, sugiero que nos dividamos en 3 grandes áreas según los intereses de cada uno:

1. **Área de Data Science / IA:** 
   - *Misión:* Encontrar la forma (modelos) de leer un texto, entenderlo y extraer las palabras clave o categorías.
2. **Área de Backend:**
   - *Misión:* Crear la API (el "servidor") que reciba las peticiones de los usuarios, consulte al modelo de IA y devuelva la respuesta.
3. **Área de Frontend / Diseño:**
   - *Misión:* Diseñar y construir la pantalla visual donde los usuarios o jueces probarán nuestro proyecto.