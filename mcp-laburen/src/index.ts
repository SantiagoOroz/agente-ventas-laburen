export interface Env {
	DB: D1Database;
}

// Headers para permitir que Laburen (o cualquier web) acceda a tu API
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 1. Manejar pre-flight de CORS (necesario para dashboards web)
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// 2. Validar método POST
		if (request.method !== "POST") {
			return new Response("MCP Server Active. Use POST JSON-RPC.", {
				status: 200,
				headers: corsHeaders
			});
		}

		try {
			const body = (await request.json()) as any;
			const method = body.method;
			const msgId = body.id;

			let result: any = {};

			// ------------------------------------------------------------------
			// HANDLER A: INITIALIZE (El saludo obligatorio del protocolo)
			// ------------------------------------------------------------------
			if (method === "initialize") {
				result = {
					protocolVersion: "2024-11-05",
					capabilities: {
						tools: { listChanged: false }
					},
					serverInfo: {
						name: "laburen-shop-worker",
						version: "1.0.0"
					}
				};
			}
			// ------------------------------------------------------------------
			// HANDLER B: TOOLS LIST (Descubrimiento de herramientas)
			// ------------------------------------------------------------------
			else if (method === "tools/list") {
				result = {
					tools: [
						{
							name: "list_products",
							description: "Busca productos en el inventario. Filtra por nombre (query) o precio.",
							inputSchema: {
								type: "object",
								properties: {
									query: { type: "string" },
									min_price: { type: "number" },
									max_price: { type: "number" },
									limit: { type: "number" }
								}
							}
						},
						{
							name: "create_cart",
							description: "Crea un carrito nuevo y devuelve su ID.",
							inputSchema: { type: "object", properties: {} }
						},
						{
							name: "add_to_cart",
							description: "Agrega items a un carrito existente. Valida stock.",
							inputSchema: {
								type: "object",
								properties: {
									cart_id: { type: "string" },
									product_id: { type: "string" },
									qty: { type: "number" }
								},
								required: ["cart_id", "product_id", "qty"]
							}
						}
					]
				};
			}
			// ------------------------------------------------------------------
			// HANDLER C: TOOLS CALL (Ejecución)
			// ------------------------------------------------------------------
			else if (method === "tools/call") {
				const toolName = body.params.name;
				const args = body.params.arguments || {};

				switch (toolName) {
					case "list_products": {
						// Seleccionamos todo. Filtramos por stock y que esté activo (columna is_active)
						let sql = "SELECT * FROM products WHERE stock > 0 AND is_active = 1";
						const params: any[] = [];

						if (args.query) {
							// AHORA BUSCAMOS EN MÚLTIPLES COLUMNAS PARA MÁS PRECISIÓN
							sql += " AND (name LIKE ? OR type LIKE ? OR description LIKE ? OR color LIKE ?)";
							const q = `%${args.query}%`;
							params.push(q, q, q, q);
						}

						if (args.min_price) { sql += " AND price >= ?"; params.push(args.min_price); }
						if (args.max_price) { sql += " AND price <= ?"; params.push(args.max_price); }

						sql += " LIMIT ?";
						params.push(args.limit || 5);

						const { results } = await env.DB.prepare(sql).bind(...params).all();
						result = { content: [{ type: "text", text: JSON.stringify(results) }] };
						break;
					}

					case "create_cart": {
						const cartId = crypto.randomUUID();
						await env.DB.prepare("INSERT INTO carts (id) VALUES (?)").bind(cartId).run();
						result = { content: [{ type: "text", text: `Carrito ID: ${cartId}` }] };
						break;
					}

					case "add_to_cart": {
						const { cart_id, product_id, qty } = args;
						const product: any = await env.DB.prepare("SELECT stock FROM products WHERE id = ?").bind(product_id).first();

						if (!product || product.stock < qty) {
							result = { content: [{ type: "text", text: "Error: Stock insuficiente." }], isError: true };
						} else {
							await env.DB.batch([
								env.DB.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").bind(qty, product_id),
								env.DB.prepare("INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)").bind(cart_id, product_id, qty)
							]);
							result = { content: [{ type: "text", text: "Producto agregado correctamente." }] };
						}
						break;
					}
					default:
						throw new Error("Herramienta desconocida");
				}
			}
			// ------------------------------------------------------------------
			// HANDLER D: OTROS MENSAJES DE PROTOCOLO (Ping, etc)
			// ------------------------------------------------------------------
			else if (method === "notifications/initialized") {
				// El cliente confirma que ya iniciamos. No devolvemos nada o OK.
				result = true;
			}
			else {
				// Método no soportado pero respondemos vacío para no romper
				// throw new Error("Método no soportado: " + method);
			}

			// RESPUESTA FINAL JSON-RPC
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: msgId,
				result: result
			}), {
				headers: { ...corsHeaders, "Content-Type": "application/json" }
			});

		} catch (error: any) {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				id: null,
				error: { code: -32603, message: error.message }
			}), {
				headers: { ...corsHeaders, "Content-Type": "application/json" }
			});
		}
	},
};