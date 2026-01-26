import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 1. Configurar el Servidor MCP
		const server = new McpServer({
			name: "laburen-ecommerce-mcp",
			version: "1.0.0"
		});

		// Tool 1: list_products
		server.tool("list_products", {
			query: z.string().optional().describe("Palabra clave para buscar"),
			min_price: z.number().optional().describe("Precio mínimo"),
			max_price: z.number().optional().describe("Precio máximo"),
			limit: z.number().default(5).describe("Cantidad de productos a mostrar")
		}, async (args) => {
			let sql = "SELECT * FROM products WHERE stock > 0";
			const params: any[] = [];

			if (args.query) {
				sql += " AND name LIKE ?";
				params.push(`%${args.query}%`);
			}
			if (args.min_price) {
				sql += " AND price >= ?";
				params.push(args.min_price);
			}
			if (args.max_price) {
				sql += " AND price <= ?";
				params.push(args.max_price);
			}
			sql += " LIMIT ?";
			params.push(args.limit);

			const { results } = await env.DB.prepare(sql).bind(...params).all();
			return {
				content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
			};
		});

		// Tool 2: create_cart
		server.tool("create_cart", {}, async () => {
			const cartId = crypto.randomUUID(); // Genera un ID único
			await env.DB.prepare("INSERT INTO carts (id) VALUES (?)").bind(cartId).run();

			return {
				content: [{ type: "text", text: `Carrito creado exitosamente. Cart ID: ${cartId}` }]
			};
		});

		// Tool 3: add_to_cart (Valida stock y lo actualiza)
		server.tool("add_to_cart", {
			cart_id: z.string(),
			product_id: z.string(),
			qty: z.number().min(1)
		}, async (args) => {
			// Verificar stock
			const product: any = await env.DB.prepare("SELECT stock FROM products WHERE id = ?").bind(args.product_id).first();

			if (!product || product.stock < args.qty) {
				return { content: [{ type: "text", text: "Error: Stock insuficiente o producto no encontrado." }] };
			}

			// Actualizar stock y agregar al carrito (Transacción simplificada)
			await env.DB.batch([
				env.DB.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").bind(args.qty, args.product_id),
				env.DB.prepare("INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)").bind(args.cart_id, args.product_id, args.qty)
			]);

			return {
				content: [{ type: "text", text: `Agregados ${args.qty} items del producto ${args.product_id} al carrito ${args.cart_id}.` }]
			};
		});

		// 2. Manejar la petición HTTP del Agente (JSON-RPC)
		if (request.method !== "POST") {
			return new Response("MCP Server is running. Use POST to interact.", { status: 200 });
		}

		// Forzamos el tipado a 'any' para evitar errores de TS
		const body = (await request.json()) as any;
		const toolName = body.method.replace("tools/", "");

		// Aseguramos que los argumentos existan, si no, pasamos un objeto vacío
		const args = body.params?.arguments || {};
		const result = await server.callTool(toolName, args);

		return new Response(JSON.stringify({
			jsonrpc: "2.0",
			id: body.id,
			result: result
		}), { headers: { "Content-Type": "application/json" } });
	},
};