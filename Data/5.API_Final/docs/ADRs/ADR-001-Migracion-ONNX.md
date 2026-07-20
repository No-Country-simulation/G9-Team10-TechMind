# ADR-001: Migración de PyTorch a ONNX Runtime Cuantizado

## Estado
Aceptado

## Contexto
El motor de búsqueda semántica inicial desarrollado por el equipo utilizaba `sentence-transformers` y dependía de PyTorch. Al intentar empaquetar el servicio, notamos que el consumo de memoria RAM base de PyTorch era superior a los 2.0 GB. Dado que los requerimientos de infraestructura dictan que la API debe poder desplegarse en entornos Free Tier (limitados típicamente a 512 MB de RAM), esta dependencia masiva representaba un bloqueo de despliegue ("Showstopper").

## Decisión
Hemos decidido **eliminar PyTorch del stack de producción** y migrar el pipeline de inferencia a **ONNX Runtime**. 
Adicionalmente, hemos aplicado **Cuantización Dinámica a 8-bits (Int8)** sobre el modelo NLP subyacente (`paraphrase-multilingual-MiniLM-L12-v2`). La tokenización, el *Mean Pooling* y la *Normalización L2* han sido reimplementados manualmente utilizando `numpy`.

## Consecuencias
**Positivas:**
- Reducción extrema del peso en disco (imagen Docker) y consumo de memoria RAM. El servicio pasó de requerir >2.0 GB a operar cómodamente con **~110 MB**.
- Velocidad de inferencia mejorada por las optimizaciones en CPU de ONNX Runtime, bajando la latencia a <50ms por query.
- Mayor portabilidad del microservicio sin depender de binarios pesados.

**Negativas:**
- Mayor complejidad del código fuente, al tener que procesar matemáticamente la salida cruda de la sesión ONNX (tensores `last_hidden_state`) para obtener el vector de embedding final, lo cual incrementa la deuda técnica y requiere que futuros mantenedores entiendan álgebra lineal básica.
