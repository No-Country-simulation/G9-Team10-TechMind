# 🏗️ Plan de Implementación Arquitectónica (OCI)

## 1. Visión General
Este documento detalla el plan arquitectónico inicial y las decisiones de diseño tomadas para el despliegue de **TechMind** en Oracle Cloud Infrastructure (OCI). El objetivo principal de este diseño es garantizar la máxima seguridad (Zero-Trust), eficiencia de costos (aprovechando la capa Always Free) y rendimiento óptimo para cargas de Inteligencia Artificial.

## 2. Decisiones de Red (Networking)
Se optó por una arquitectura de **Virtual Cloud Network (VCN)** segmentada para aislar los recursos críticos de internet:
*   **VCN Principal:** `TechMind-VCN` (Bloque CIDR: `10.0.0.0/16`).
*   **Subred Pública:** `10.0.0.0/24`. Diseñada exclusivamente para recursos que deben ser accesibles desde internet (API Gateway).
*   **Subred Privada:** `10.0.1.0/24`. Aislada completamente del exterior. Aquí residen los motores de procesamiento pesado y los datos sensibles.

### Gateways y Enrutamiento
*   **Internet Gateway (IGW):** Acoplado a la Subred Pública para permitir tráfico entrante y saliente hacia internet.
*   **NAT Gateway:** Acoplado a la Subred Privada. Permite que las instancias internas descarguen paquetes y actualizaciones de internet de forma segura, pero bloquea cualquier intento de conexión desde el exterior hacia las máquinas.

## 3. Estrategia de Cómputo (Compute)
Se decidió utilizar instancias **ARM Ampere A1 (VM.Standard.A1.Flex)** debido a su alto rendimiento multinúcleo y su inclusión en la capa gratuita de OCI (hasta 4 OCPUs y 24 GB de RAM).
*   **VM Spring Boot (API Gateway - Subred Pública):** 1 OCPU, 6 GB RAM. Actúa como punto de entrada y *Bastion Host* (Servidor de Salto SSH).
*   **VM Motor IA FastAPI (Subred Privada):** 2 OCPUs, 12 GB RAM. Requiere la mayor cantidad de memoria para cargar modelos de Scikit-Learn y procesar datos rápidamente en Python.
*   **VM Base de Datos MySQL (Subred Privada):** 1 OCPU, 6 GB RAM. Suficiente para manejar las transacciones relacionales del backend.

## 4. Políticas de Seguridad (Security Lists)
En lugar de depender únicamente del firewall del sistema operativo (UFW), la seguridad se impone a nivel de red (OCI Security Lists):
*   **Lista de Seguridad Pública:** Solo permite tráfico entrante en los puertos `22` (SSH - idealmente restringido a la IP del administrador) y el puerto del API Gateway (ej. `8080`).
*   **Lista de Seguridad Privada:** Deniega absolutamente todo el tráfico entrante de internet. Solo permite conexiones entrantes (SSH `22`, MySQL `3306`, FastAPI `8000`) cuyo origen sea específicamente la Subred Pública (`10.0.0.0/24`).

## 5. Identidad y Acceso (IAM)
Para evitar el almacenamiento de credenciales estáticas (claves de API, contraseñas de buckets) en el código fuente:
1.  Se crea un **Dynamic Group** en OCI que engloba el OCID de la máquina de IA.
2.  Se asigna una **Política (Policy)** a ese grupo permitiéndole leer y gestionar archivos del *Object Storage*.
3.  La aplicación en Python utiliza *Instance Principals* nativos del SDK de Oracle para autenticarse automáticamente.
