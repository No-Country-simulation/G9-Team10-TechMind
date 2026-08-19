🗺️ TechMind: Área BackEnd:
Bienvenidos al repositorio back-end final del proyecto techmind clasificando documentos. En este README indagaremos con la arquitectura y construccion de la API-REST.

---

## 👥 Integrantes del equipo:
- Valentina Parra	Software Engineer.
- Juan Manuel Rios	Backend Developer.

---

## Arquitectura General del Proyecto:

<img width="5140" height="3420" alt="EsquemaEntero excalidraw" src="https://github.com/user-attachments/assets/8cc9400c-6e60-4a10-a25a-a6123bf18f99" />

Se desarrollo una arquitectura modular-hexagonal donde se evidencia una relación Many-To-Many. Documents y keywords como entidades principales de la relación y Document-Keyword una entidad intermedia para registrar las relación many-to-many.

---

## Modulo Documents:

<img width="400"  alt="DocumentsModulo excalidraw" src="https://github.com/user-attachments/assets/6387c14e-9b05-4a7a-89c5-813c97f09bb9" />

El módulo Documents es el núcleo de la gestión documental dentro del sistema. Su responsabilidad principal es orquestar el ciclo de vida de los documentos, actuando como el coordinador central que integra las diferentes capacidades del backend.

Responsabilidades Principales
- Comunicación con la Capa de Datos: Actúa como el punto de entrada para las operaciones relacionadas con documentos, recibiendo peticiones del front-end a través de su   API REST.
- Creación y Gestión de Documentos: Es responsable de la creación, almacenamiento y recuperación de entidades Document. Esto incluye la gestión de sus metadatos
  (título, contenido, nivel) y su estado.
- Coordinación con el Módulo de Keywords: Cuando se procesa un documento, el módulo Documents se comunica con el módulo Keywords para:
  * Verificar si las keywords extraídas ya existen en el sistema.
  * Solicitar la creación de aquellas keywords que sean nuevas.
  * Gestión de la Relación Many-to-Many: A través del módulo DocumentKeyword, el módulo Documents se encarga de:
  * Crear las relaciones entre un documento y sus keywords asociadas.
  * Almacenar esta relación en la tabla intermedia de la base de datos SQL.




