from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import strava
from database import init_db

app = FastAPI(title="Straviz API")

@app.on_event("startup")
async def on_startup():
    await init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strava.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Straviz API"}
