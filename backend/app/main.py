import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database.connection import init_db
from app.routes import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} ({settings.ENVIRONMENT})...")
    await init_db()
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Agentic AI Student PDF Study Assistant - Multi-Agent RAG & Adaptive Learning Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-study-agent-backend"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check backend logs."}
    )
