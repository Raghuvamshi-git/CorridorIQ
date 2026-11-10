import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

logger = logging.getLogger("corridoriq.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

def get_engine():
    target_url = settings.DATABASE_URL
    is_mysql = target_url.startswith("mysql")
    
    if is_mysql:
        try:
            logger.info(f"Attempting connection to MySQL: {target_url.split('@')[-1]}")
            engine = create_engine(
                target_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            # Test immediate connectivity
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to MySQL database.")
            return engine, "mysql"
        except Exception as e:
            if settings.USE_SQLITE_FALLBACK:
                fallback_url = "sqlite:///./corridoriq.db"
                logger.warning(
                    f"MySQL connection failed ({e}). Falling back to SQLite development database: {fallback_url}. "
                    "NOTE: The application is running in SQLite development fallback mode."
                )
                engine = create_engine(
                    fallback_url,
                    connect_args={"check_same_thread": False}
                )
                return engine, "sqlite_fallback"
            else:
                raise e
    else:
        # Direct SQLite or custom URL
        connect_args = {"check_same_thread": False} if target_url.startswith("sqlite") else {}
        engine = create_engine(target_url, connect_args=connect_args)
        dialect = "sqlite" if target_url.startswith("sqlite") else "generic"
        return engine, dialect

engine, ACTIVE_DIALECT = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables defined by SQLAlchemy Base."""
    Base.metadata.create_all(bind=engine)
    logger.info(f"Initialized database tables successfully using engine dialect: {ACTIVE_DIALECT}")

