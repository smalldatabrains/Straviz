from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import strava

app = FastAPI(title="Straviz API")

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
