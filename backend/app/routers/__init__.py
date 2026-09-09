from app.routers.auth import router as auth_router
from app.routers.events import router as events_router
from app.routers.photos import router as photos_router
from app.routers.galleries import router as galleries_router

__all__ = ["auth_router", "events_router", "photos_router", "galleries_router"]
