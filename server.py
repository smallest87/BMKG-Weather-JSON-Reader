import os
import json
from aiohttp import web

# Set folder static ke direktori tempat script berada
ROOT_DIR = os.path.dirname(__file__)

# Simpan semua klien yang terhubung (Websocket)
active_connections = []

async def index(request):
    """Serve file index.html atau view_cuaca_universal.html"""
    return web.FileResponse(os.path.join(ROOT_DIR, 'view_cuaca_universal.html'))

async def overlay(request):
    """Serve file overlay"""
    return web.FileResponse(os.path.join(ROOT_DIR, 'overlay_cuaca.html'))

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    active_connections.append(ws)
    print("Client connected via WebSocket")

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                # Saat menerima data dari satu klien (Sender),
                # Broadcast ke semua klien lain (termasuk Overlay)
                data = msg.data
                print(f"Broadcasting message: {data[:50]}...") # Print sebagian
                
                for connection in active_connections:
                    if connection.closed:
                        continue
                    await connection.send_str(data)
            elif msg.type == web.WSMsgType.ERROR:
                print(f'ws connection closed with exception {ws.exception()}')
    finally:
        active_connections.remove(ws)
        print("Client disconnected")

    return ws

# Setup Routes
app = web.Application()
app.add_routes([
    web.get('/', index),
    web.get('/overlay', overlay),
    web.get('/ws', websocket_handler),
    web.static('/', ROOT_DIR) # Serve file statis (js, css, json)
])

if __name__ == '__main__':
    print("🚀 Server berjalan di http://localhost:8080")
    print("👉 Buka Controller: http://localhost:8080")
    print("👉 Buka Overlay:    http://localhost:8080/overlay")
    web.run_app(app, port=8080)