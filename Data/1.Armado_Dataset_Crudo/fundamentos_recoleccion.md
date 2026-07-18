# 📖 Fundamentos de Recolección de Datos (TechMind MVP)

Este documento detalla la estrategia de recolección de datos crudos (Fase 1) para el proyecto TechMind, incorporando estándares de calidad para Machine Learning.

## ¿Qué hace el script de recolección?
El script (`01_recoleccion.py`) se conecta a repositorios públicos de HuggingFace y a la API de GitHub para descargar de forma controlada muestras de diferentes orígenes. Aplica un proceso de deduplicación y genera un único archivo: `dataset_techmind_raw.csv`. 

El script **no realiza limpieza**. Su única función es la "Ingesta" (Extraer y Cargar).

## ¿En qué nos basamos para hacerlo así?
El Hackathon exige que nuestra solución organice diversos textos técnicos. Nos basamos en los siguientes principios de "Data Engineering" y consejos de IAs arquitectónicas:
1. **Diversidad Realista del Dato:** Si entrenamos con un solo dominio, el modelo sufrirá *overfitting* (sobreajuste).
2. **Trazabilidad y Metadatos:** Guardamos el origen del dato (`source_type`) y si contiene ruido inyectado a propósito (`is_synthetic_noise`) para poder evaluar si el sistema aprendió ruido real o memorizó nuestros patrones artificiales.
3. **Reproducibilidad:** Usamos una semilla fija (`random.seed`) para que el equipo trabaje siempre con la misma mezcla de datos predecible.

## ¿Por qué lo hicimos así?
Para simular el caos del mundo real, el dataset crudo incluye intencionalmente fuentes radicalmente distintas:

1. **Artículos Formales (`ML-ArXiv-Papers`):** Representa PDFs académicos y descripciones teóricas largas.
2. **Tutoriales y Código (`python-codes-25k`):** Representa apuntes de estudiantes y cursos con código.
3. **Documentación Real (GitHub READMEs):** Descargamos documentación oficial cruda (Markdown, badges, HTML, tablas) de repositorios gigantes como FastAPI, React y Pandas. *Objetivo: Proveer la mayor riqueza estructural y el mayor desafío de limpieza para el equipo.*
4. **Casos Extremos (Ruido Sintético Inyectado):** Fragmentos con etiquetas HTML rotas y errores 404, identificados con un flag booleano para no contaminar las métricas de evaluación posteriores.

**Objetivo del diseño:**
Entregar este dataset al resto del equipo asegura que la siguiente etapa (Limpieza / Data Wrangling) sea un desafío genuino que les permitirá demostrar sus habilidades de ingeniería de datos al jurado.
