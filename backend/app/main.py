"""
MyChat - Federated Privacy-First Chat System
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import init_db, close_db
from app.api.endpoints import auth, users, messages, contacts, groups, keys, node


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="MyChat API",
    description="Federated Privacy-First Chat System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
app.include_router(messages.router, prefix=f"{settings.API_V1_PREFIX}/messages", tags=["Messages"])
app.include_router(contacts.router, prefix=f"{settings.API_V1_PREFIX}/contacts", tags=["Contacts"])
app.include_router(groups.router, prefix=f"{settings.API_V1_PREFIX}/groups", tags=["Groups"])
app.include_router(keys.router, prefix=f"{settings.API_V1_PREFIX}/keys", tags=["Keys"])
app.include_router(node.router, prefix=f"{settings.API_V1_PREFIX}/node", tags=["Node Info"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MyChat",
        "version": "1.0.0",
        "description": "Federated Privacy-First Chat System",
        "domain": settings.DOMAIN,
        "federation_enabled": settings.FEDERATION_ENABLED,
        "registration_open": settings.REGISTRATION_OPEN
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
