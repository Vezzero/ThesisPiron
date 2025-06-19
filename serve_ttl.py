# serve_ttl.py
import http.server, socketserver, mimetypes

# aggiungi il tipo Turtle
mimetypes.add_type('text/turtle', '.ttl')

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
