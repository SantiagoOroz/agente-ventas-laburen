import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
// IMPORTANTE: Importamos 'worker' y también la interfaz 'Env'
import worker, { Env } from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('MCP Server Worker', () => {
	it('responds with MCP status on GET request (unit style)', async () => {
		const request = new IncomingRequest('http://example.com', { method: 'GET' });
		const ctx = createExecutionContext();

		// AQUÍ ESTÁ EL FIX: Forzamos (cast) 'env' para que TypeScript lo acepte como tu Env con D1
		const response = await worker.fetch(request, env as unknown as Env, ctx);

		await waitOnExecutionContext(ctx);
		expect(await response.text()).toMatchInlineSnapshot(`"MCP Server is running. Use POST to interact."`);
	});

	it('responds with MCP status on GET request (integration style)', async () => {
		const response = await SELF.fetch('https://example.com', { method: 'GET' });
		expect(await response.text()).toMatchInlineSnapshot(`"MCP Server is running. Use POST to interact."`);
	});
});