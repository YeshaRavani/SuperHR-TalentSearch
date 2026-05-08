from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, opportunities, admin, applications, community, ai, rewards

# Create tables in database (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Talent Search API",
    description="Backend API for the Plaksha University Talent Search platform",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(opportunities.router, prefix="/api", tags=["Opportunities"])
app.include_router(applications.router, prefix="/api", tags=["Applications"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(community.router, prefix="/api", tags=["Community"])
app.include_router(ai.router, prefix="/api", tags=["AI"])
app.include_router(rewards.router, prefix="/api", tags=["Rewards"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Talent Search API. Visit /docs for Swagger UI."}
