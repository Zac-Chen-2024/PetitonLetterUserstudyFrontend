from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.error_handlers import install as install_error_handlers
from app.routers.projects import router as projects_router
from app.routers.writing import router as writing_router
from app.routers.snippets import router as snippets_router
from app.routers.provenance import router as provenance_router
from app.routers.arguments import router as arguments_router
from app.routers.extraction import router as extraction_router
from app.routers.documents import router as documents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    print("[Startup] EB-1A Petition API starting...")
    print("[Startup] Ready to serve requests")
    yield
    print("[Shutdown] EB-1A Petition API shutting down...")


app = FastAPI(
    title="EB-1A Petition API",
    description="EB-1A / NIW Immigration Petition Letter Authoring System",
    version="2.0.0",
    lifespan=lifespan
)

install_error_handlers(app)

# CORS — 白名单驱动。带凭证时不能用 "*"。
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers (new frontend only)
app.include_router(projects_router)
app.include_router(writing_router)
app.include_router(snippets_router)
app.include_router(provenance_router)
app.include_router(arguments_router)
app.include_router(extraction_router)
app.include_router(documents_router)


@app.get("/")
def root():
    return {
        "name": "EB-1A Petition API",
        "version": "2.0.0",
        "routers": [
            "projects", "documents", "extraction",
            "arguments", "writing", "snippets", "provenance"
        ]
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
