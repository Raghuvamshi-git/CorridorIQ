import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import init_db, ACTIVE_DIALECT

from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.routes import router as routes_router
from backend.app.api.routes.vehicles import router as vehicles_router
from backend.app.api.routes.analytics import router as analytics_router
from backend.app.api.routes.dispatch import router as dispatch_router
from backend.app.api.routes.agent import router as agent_router

logger = logging.getLogger("corridoriq.main")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting CorridorIQ Backend ({settings.VERSION})")
    logger.info(f"Active Operating Region: {settings.OPERATING_REGION}")
    logger.info(f"Active Database Engine Dialect: {ACTIVE_DIALECT}")
    init_db()
    yield
    logger.info("CorridorIQ Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "CorridorIQ is an enterprise-grade agentic transport operations platform for the "
        "Hyderabad Metropolitan Region, Telangana, India. It combines GTFS-inspired relational data, "
        "real-time operational analytics, and Google Gemini AI with native function calling."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(health_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(routes_router, prefix=api_prefix)
app.include_router(vehicles_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(dispatch_router, prefix=api_prefix)
app.include_router(agent_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "region": settings.OPERATING_REGION,
        "status": "operational",
        "documentation": "/docs"
    }
