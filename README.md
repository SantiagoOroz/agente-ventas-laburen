# Agente de Ventas Inteligente - Laburen.com (MCP Edition)

Este repositorio contiene la configuración y lógica de un Agente de Ventas Senior diseñado para Laburen.com. El agente utiliza el protocolo MCP (Model Context Protocol) para interactuar con una base de datos dinámica y gestionar ventas en tiempo real a través de WhatsApp/Chatwoot.


## 🤖 Propósito del Proyecto
El objetivo principal es demostrar una integración avanzada entre modelos de lenguaje (LLMs) y sistemas externos. Este agente no es un bot informativo; es un agente transaccional orientado al cierre de ventas y a la gestión eficiente de carritos de compra, eliminando las interfaces rígidas de menús numéricos.

## 🚀 Cómo desplegar
1. Instalar dependencias: npm install
2. Crear base de datos D1: npx wrangler d1 create laburen-db
3. Configurar wrangler.toml con el ID de tu base de datos.
4. Cargar datos iniciales: npx wrangler d1 execute laburen-db --file=./schema.sql
5. Desplegar: npm run deploy

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
