# Ajustes Adicionales en OCI (Oracle Cloud Infrastructure)

Este documento contiene las recomendaciones de arquitectura para el equipo de Backend y DevOps, con el objetivo de solucionar el problema de despliegue HTTPS en OCI.

Dado que la infraestructura de Oracle requiere HTTPS estricto y la aplicación actualmente sirve tráfico en HTTP plano, se deben aplicar una de las siguientes soluciones a nivel de infraestructura. **No es necesario (ni recomendable) modificar el código fuente de Spring Boot, Python o Vite** para forzar certificados internos, sino manejar la *terminación SSL* en la capa de red.

---

## Opción 1: Balanceador de Carga OCI con Terminación SSL (Recomendada para Producción 🌟)

Esta es la solución más robusta, segura y fácil de mantener a largo plazo.

1. **Crear el Balanceador:** En la consola de OCI, aprovisionar un *Load Balancer* público.
2. **Configurar el Listener (Puerto 443):** Crear un listener que escuche el tráfico HTTPS externo.
3. **Asignar Certificado SSL:**
   * Utilizar el servicio *OCI Certificates* para generar un certificado gestionado gratuito, o subir un certificado SSL existente.
   * Vincular este certificado al listener del puerto 443.
4. **Configurar el Backend Set (Puerto HTTP interno):**
   * Apuntar el balanceador hacia las IPs privadas de las Compute Instances (Máquinas Virtuales) donde corren los contenedores (Frontend en puerto 80/5173, Spring Boot en 8080, Python en 8000).
   * La comunicación entre el Load Balancer y las instancias se mantendrá en HTTP normal (sin encriptar), reduciendo la carga de CPU en las instancias.

---

## Opción 2: Proxy Inverso con NGINX + Certbot (Para arquitecturas monolíticas / Una sola VM)

Si toda la plataforma (Frontend, Spring Boot, Python) se despliega en una única Máquina Virtual y hay un dominio configurado (ej: `api.techmind.com`):

1. **Instalar NGINX:**
   * Configurar NGINX en la VM para que escuche en los puertos `80` y `443`.
   * Configurar bloques `server` para actuar como *Reverse Proxy*, enrutando el tráfico según las rutas:
     * `/` -> Puerto de Vite/React.
     * `/api` -> Puerto 8080 (Spring Boot).
     * `/ai` -> Puerto 8000 (Python).
2. **Generar SSL con Let's Encrypt:**
   * Instalar `certbot` y el plugin de NGINX (`sudo apt install certbot python3-certbot-nginx`).
   * Ejecutar `sudo certbot --nginx`. Certbot detectará los dominios configurados en NGINX, emitirá certificados SSL gratuitos y reescribirá el archivo `nginx.conf` automáticamente para forzar la redirección de HTTP a HTTPS.

---

## Opción 3: Plugin de Vite (Solo para pruebas rápidas de Frontend)

Si el equipo solo necesita probar el Frontend desplegado y saltarse la restricción del navegador de forma temporal (sin dominio):

1. Instalar el plugin en el proyecto frontend: `npm install @vitejs/plugin-basic-ssl -D`
2. Configurar `vite.config.ts`:
   ```typescript
   import basicSsl from '@vitejs/plugin-basic-ssl'
   export default defineConfig({
     plugins: [react(), basicSsl()]
   })
   ```
*Nota: Esto generará un certificado autofirmado. El navegador mostrará un aviso de seguridad que el usuario deberá aceptar manualmente.*
