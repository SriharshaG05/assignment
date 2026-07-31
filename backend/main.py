from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt

from app.config.settings import settings
from app.database.session import Base, engine, get_db
from app.websocket.connection_manager import manager
from app.models.user import User

# Import all routers
from app.api.controllers.auth import router as auth_router
from app.api.controllers.users import router as users_router
from app.api.controllers.companies import router as companies_router
from app.api.controllers.contacts import router as contacts_router
from app.api.controllers.assignments import router as assignments_router
from app.api.controllers.notifications import router as notifications_router

# Auto create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Live CRM Notification System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(companies_router)
app.include_router(contacts_router)
app.include_router(assignments_router)
app.include_router(notifications_router)

@app.get("/")
def read_root():
    return {"message": "Live CRM Notification API is running."}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Establish a database session for authentication check
    db = next(get_db())
    try:
        # Decode and validate token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = int(user_id_str)
        # Verify user exists in the database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    finally:
        db.close()

    # Register connection in WebSocket manager
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Hold the connection open, listen for messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
