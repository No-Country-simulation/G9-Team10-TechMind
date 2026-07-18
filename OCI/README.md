# ☁️ DevOps: Despliegue en Oracle Cloud Infrastructure (OCI)

Bienvenidos a la carpeta de investigación de **OCI (Oracle Cloud Infrastructure)**.
Dado que los módulos de Frontend y Data (API) están muy avanzados, esta sección está dedicada a los miembros del equipo que tengan disponibilidad para investigar y planificar nuestro despliegue en la nube mientras el Backend termina su integración.

## 🎯 Objetivos de Investigación

Necesitamos documentar y probar cómo vamos a subir nuestras 3 piezas a la nube:

1.  **Frontend (React/Vite):** 
    *   ¿Cómo lo servimos? ¿Nginx? ¿Un Bucket de OCI (Object Storage) estático?
2.  **Backend (Spring Boot / Java):** 
    *   ¿Cómo desplegamos el `.jar`? ¿Usaremos Docker + OCI Container Instances?
    *   ¿Cómo configuramos la base de datos MySQL en OCI (Autonomous Database o una Instancia Compute)?
3.  **Data (FastAPI - Python):**
    *   Necesitamos crear un `Dockerfile` para empaquetar la API de la Fase 5.
    *   **Punto Crítico:** Los archivos `.joblib` de Machine Learning son muy pesados para GitHub. ¿Cómo hacemos para que el contenedor los descargue desde un *Object Storage* de OCI al arrancar?

## 📝 Enlaces y Recursos Útiles (A Completar)
*(Agreguen aquí enlaces a repositorios ajenos, tutoriales, videos de YouTube o documentación de Oracle Cloud que consideren valiosos para el equipo)*

*   [Ejemplo: Desplegando FastAPI en OCI](#)
*   [Ejemplo: Spring Boot en Oracle Cloud](#)
*   [...](#)

## 🏗️ Tareas Pendientes para los Libres
- [ ] Crear el `Dockerfile` básico para el Frontend.
- [ ] Crear el `Dockerfile` básico para la API de Datos.
- [ ] Investigar cómo crear una instancia gratuita (Always Free) en OCI.
- [ ] Investigar cómo guardar archivos pesados (Modelos ML) en OCI Object Storage.

---
**¡Manos a la obra! Cualquier avance o descubrimiento, documéntenlo en esta carpeta.**
