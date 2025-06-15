import asyncio
import zmq
import zmq.asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json

# Initialize the FastAPI application.
app = FastAPI()

# A manager class to handle all active WebSocket connections.
class ConnectionManager:
    def __init__(self):
        # A list to store active WebSocket connection objects.
        self.active_connections: List =

    async def connect(self, websocket: WebSocket):
        # Accept a new WebSocket connection.
        await websocket.accept()
        # Add the new connection to our list of active connections.
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Remove a WebSocket connection from the list when it disconnects.
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # Send a message to all connected clients.
        for connection in self.active_connections:
            await connection.send_text(message)

# Create a single instance of the ConnectionManager to be used by the application.
manager = ConnectionManager()

# This function runs as a background task to listen for messages from the C++ engine.
async def zmq_listener():
    # Create an asynchronous ZeroMQ context.
    context = zmq.asyncio.Context()
    # Create a SUB (Subscriber) socket.
    socket = context.socket(zmq.SUB)
    # Connect to the C++ backend service. 'backend-cpp' is the service name defined in docker-compose.yml.
    socket.connect("tcp://backend-cpp:5555")
    # Subscribe to all topics. An empty string subscribes to everything.
    socket.setsockopt_string(zmq.SUBSCRIBE, "")

    print("ZMQ Listener started, connected to tcp://backend-cpp:5555")

    # Loop indefinitely to receive messages.
    while True:
        try:
            # Asynchronously wait for a message from the publisher.
            message = await socket.recv_string()
            # Once a message is received, broadcast it to all connected WebSocket clients.
            await manager.broadcast(message)
        except Exception as e:
            print(f"Error in ZMQ listener: {e}")
            await asyncio.sleep(1) # Avoid tight loop on error

# This event handler runs when the FastAPI application starts.
@app.on_event("startup")
async def startup_event():
    # Create the zmq_listener as a background task that runs concurrently with the web server.
    asyncio.create_task(zmq_listener())

# This is the WebSocket endpoint that the frontend will connect to.
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # When a new client connects, register it with the connection manager.
    await manager.connect(websocket)
    print(f"New client connected. Total clients: {len(manager.active_connections)}")
    try:
        # Loop indefinitely to keep the connection open.
        while True:
            # Wait for a message from the client. This can be used for heartbeats or client-side commands.
            # If the client disconnects, this will raise an exception.
            await websocket.receive_text()
    except WebSocketDisconnect:
        # If the client disconnects, remove it from the connection manager.
        manager.disconnect(websocket)
        print(f"Client disconnected. Total clients: {len(manager.active_connections)}")
