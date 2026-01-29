from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
import json

class WebhookHandler(BaseHTTPRequestHandler):
    # 1. ESTO VALIDA EL WEBHOOK (Ya te funciona)
    def do_GET(self):
        query_components = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if "hub.challenge" in query_components:
            challenge = query_components["hub.challenge"][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(challenge.encode())
            print(f"¡Validación exitosa! Enviamos challenge: {challenge}")
        else:
            self.send_response(404)
            self.end_headers()

    # 2. ESTO RECIBE LOS MENSAJES REALES (Lo nuevo)
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length) # Leemos el JSON de WhatsApp
        
        # Intentamos mostrar el mensaje de forma bonita
        try:
            payload = json.loads(post_data.decode('utf-8'))
            print("\n--- ¡NUEVO EVENTO DE WHATSAPP! ---")
            print(json.dumps(payload, indent=4)) # Esto imprime el JSON estructurado
            print("----------------------------------\n")
        except Exception as e:
            print(f"Error procesando el JSON: {e}")

        # Siempre respondemos 200 OK para que Meta no piense que el servidor falló
        self.send_response(200)
        self.end_headers()

server = HTTPServer(('localhost', 5000), WebhookHandler)
print("Servidor listo y escuchando en el puerto 5000...")
server.serve_forever()