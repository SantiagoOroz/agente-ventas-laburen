# Agente de Ventas Inteligente - Laburen.com (MCP Edition)

Este repositorio contiene la configuración y lógica de un Agente de Ventas Senior diseñado para Laburen.com. El agente utiliza el protocolo MCP (Model Context Protocol) para interactuar con una base de datos dinámica y gestionar ventas en tiempo real a través de WhatsApp/Chatwoot.

Documentación entregable en /docs/Entregable_DesafíoTécnico 

## 🤖 Propósito del Proyecto
El objetivo principal es demostrar una integración avanzada entre modelos de lenguaje (LLMs) y sistemas externos. Este agente no es un bot informativo; es un agente transaccional orientado al cierre de ventas y a la gestión eficiente de carritos de compra, eliminando las interfaces rígidas de menús numéricos.
Forma parte del desafío técnico de Laburen.com encontrable en docs\Desafío Técnico - Laburen.com.pdf

## 🚀 Cómo desplegar
1. Ejecutar scripts Python de extracción de características.
2. Instalar dependencias: npm install
3. Crear base de datos D1: npx wrangler d1 create laburen-db
4. Configurar wrangler.toml con el ID de tu base de datos.
5. Cargar datos iniciales: npx wrangler d1 execute laburen-db --file=./schema.sql
6. Desplegar: npm run deploy

#### 🔗 Endpoints Principales
1. GET /products: Listar productos.
2. POST /cart: Crear carrito. (Ver documentación completa en la carpeta /docs)


## 🛠️ Capacidades Técnicas
### 📂 Integración con Protocolo MCP
El agente tiene acceso directo a funciones del servidor MCP para manipular datos en tiempo real:
list_products: Búsqueda inteligente de productos por nombre o descripción.
create_cart: Inicialización de transacciones ante intención de compra detectada.
update_cart: Modificación dinámica de cantidades y productos.

### 💬 Interfaz y CRM
Canal Principal: WhatsApp.
Gestión: Chatwoot (CRM de código abierto).
Persistencia: Gestión de carritos vinculados de forma unívoca a cada conversación de usuario.

## 📋 Reglas de Negocio y Protocolo
#### 1. Experiencia de Usuario (UX)
Conversación Fluida: Prohibido el uso de menús tipo "Presione 1". El agente mantiene un diálogo natural y humano.
Asistencia Proactiva: En caso de falta de stock, el agente analiza la descripción del producto para sugerir alternativas relevantes.
#### 2. Gestión de CRM y Etiquetas
Para garantizar la trazabilidad comercial, el agente automatiza el etiquetado en Chatwoot:
Etiqueta de Carrito: Aplicada inmediatamente al añadir productos.
Etiqueta de Derivación: Aplicada al transferir a un humano.
#### 3. Derivación Inteligente
Cuando el contexto supera las capacidades del agente o el usuario lo solicita, se realiza una transferencia a un agente humano, proporcionando:
Motivo del escalamiento.
Contexto de los productos de interés del cliente.


## 🛡️ Restricciones de Operación
- Veracidad de Datos: El agente tiene prohibido inventar precios, stocks o productos. Solo opera con la información proporcionada por las herramientas MCP.
- Contextualización: Debe mantener el hilo de la conversación en todo momento, evitando respuestas genéricas o fuera de contexto.


## 🛠️ Configuración (Stack)
- Motor: LLM con soporte para Function Calling.
- Base de Datos: Catálogo dinámico vía products.xlsx.
- Protocolo de Comunicación: Model Context Protocol (MCP).
- Plataforma de Chat: Integración Chatwoot + WhatsApp Gateway.

## Pasos
Paso 2: Preparación de la Base de Datos
Antes de programar el agente, necesitas que los datos estén listos en la nube.


Descarga de Datos: Descarga el archivo products.xlsx que te provee el desafío.


Diseño del Esquema: Crea el esquema de base de datos con al menos las tablas products (id, name, description, price, stock), carts (id, created_at, updated_at) y cart_items (id, cart_id, product_id, qty).


Despliegue de Base de Datos: Despliega esta base de datos, preferentemente en Cloudflare (Cloudflare D1) o en otro servicio de tu elección.


Ingesta: Importa las filas del archivo Excel a tu tabla products.

Paso 3: Desarrollo del MCP (Model Context Protocol) en Cloudflare
Este es el núcleo técnico del desafío: crear la API que usará el agente.

Inicializar Proyecto: Crea un proyecto de Cloudflare Workers en tu entorno local.


Desarrollo de Endpoints: Programa las funciones para que el MCP pueda buscar productos y mostrar detalles , además de listar productos.


Lógica de Carrito: Implementa la función create_cart para cuando el usuario muestre intención de compra , e incluye la capacidad extra de editar el carrito (update_cart).


Integración con Chatwoot API: Programa la lógica para agregar etiquetas en el CRM cuando se crea un carrito y cuando se deriva la conversación a un humano.

Paso 4: Integración del Agente en Laburen
Ahora conectarás tu código con el cerebro del LLM.


Conexión del MCP: En la plataforma de Laburen, conecta la URL de tu MCP desplegado en Cloudflare.


Selección de LLM: Prueba diferentes modelos de LLM en la plataforma para ver cuál razona mejor.


Prompt Engineering: Configura las instrucciones del agente para que mantenga una charla continua y coherente (esto vale el 55% de la nota).


Conexión Final: Conecta el agente directamente a la instancia de Chatwoot de Laburen para que quede desplegado en WhatsApp.

Paso 5: Fase Conceptual y Documentación
Prepara los entregables teóricos.


Diagrama de Flujo: Crea un diagrama (de flujo o secuencia) que ilustre cómo el agente atiende a un cliente que explora productos, crea un carrito y lo edita.


Documento Resumen: Genera un PDF o Markdown de máximo 2 páginas que incluya los endpoints utilizados y el diagrama de flujo.

Paso 6: Pruebas y Entrega Final
Recuerda que tienes 5 días para esta entrega.


Prueba en Vivo: Asegúrate de que el agente funciona directamente por Chatwoot/WhatsApp y que consume correctamente el MCP.


Empaquetado: Sube tu código al repositorio de GitHub y adjunta la carpeta con los diagramas y el documento conceptual.
