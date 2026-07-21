# ADR-002: Generación Determinista de Identificadores (MD5) en lugar de UUIDv4

## Estado
Aceptado

## Contexto
En el pipeline inicial de procesamiento de datos y limpieza, se estaba utilizando la función `uuid.uuid4()` para generar identificadores únicos para cada documento del dataset. Estos identificadores se almacenan como `doc_id` y actúan como llaves foráneas en el microservicio backend de Spring Boot (Java).
El problema de usar UUIDv4 es su naturaleza aleatoria: cada ejecución del pipeline de datos alteraba los identificadores, destruyendo la integridad referencial de la base de datos relacional y obligando a limpiar las tablas en Spring Boot tras cada corrida.

## Decisión
Hemos decidido **reemplazar UUIDv4 por Hashes MD5 deterministas**, computados en base al contenido estático del documento (ej. Título + Texto). 

## Consecuencias
**Positivas:**
- El pipeline se vuelve **Idempotente**: El mismo documento siempre generará exactamente el mismo `doc_id`, sin importar cuántas veces se regenere o limpie el dataset.
- Se mantiene la integridad relacional con el backend principal (Java).
- Se permite la des-duplicación fácil de registros repetidos (documentos idénticos colisionarán en el mismo Hash).

**Negativas:**
- El algoritmo MD5 posee vulnerabilidades teóricas de colisión en contextos criptográficos. Sin embargo, para nuestro caso de uso no-adversarial de indexación de contenido técnico, la probabilidad de colisión es estadísticamente irrelevante y la velocidad de hashing de MD5 justifica su uso frente a algoritmos más seguros como SHA-256.
