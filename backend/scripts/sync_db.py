import asyncio
import os
import sys
import httpx

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from services.strava_service import sync_activities
from dotenv import load_dotenv

# Path to the mounted .env file in Docker
ENV_PATH = "/app/.env"

async def refresh_token():
    """Refreshes the Strava access token and updates .env"""
    print("🔄 Checking token status...")
    load_dotenv(ENV_PATH)
    
    client_id = os.getenv("STRAVA_CLIENT_ID")
    client_secret = os.getenv("STRAVA_CLIENT_SECRET")
    refresh_token = os.getenv("STRAVA_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        print("❌ Missing credentials in .env")
        return None

    url = "https://www.strava.com/oauth/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, data=data)
            
            if resp.status_code == 200:
                new_tokens = resp.json()
                access_token = new_tokens.get("access_token")
                new_refresh = new_tokens.get("refresh_token")
                
                print(f"✅ Token refreshed. Access Token: {access_token[:10]}...")
                
                # Update various env vars in the file while keeping others intact is hard without a parser
                # But since we are inside the container and this file is mounted for this purpose, 
                # we can aggressively rewrite it if we know the structure, or use a safer approach.
                # For simplicity, we'll read lines and replace specific keys.
                
                new_lines = []
                if os.path.exists(ENV_PATH):
                    with open(ENV_PATH, "r") as f:
                        lines = f.readlines()
                        
                    for line in lines:
                        if line.startswith("STRAVA_ACCESS_TOKEN="):
                            new_lines.append(f"STRAVA_ACCESS_TOKEN={access_token}\n")
                        elif line.startswith("STRAVA_REFRESH_TOKEN="):
                            new_lines.append(f"STRAVA_REFRESH_TOKEN={new_refresh}\n")
                        else:
                            new_lines.append(line)
                else:
                    # If file doesn't exist for some reason (should be mounted)
                    print("⚠️ .env file not found at /app/.env")
                    return access_token

                with open(ENV_PATH, "w") as f:
                    f.writelines(new_lines)
                
                # Reload env
                os.environ["STRAVA_ACCESS_TOKEN"] = access_token
                return access_token
            else:
                print(f"⚠️ Failed to refresh token: {resp.status_code} - {resp.text}")
                # Fallback to existing token might fail if expired, but we return what we have
                return os.getenv("STRAVA_ACCESS_TOKEN")
    except Exception as e:
        print(f"❌ Error refreshing token: {e}")
        return os.getenv("STRAVA_ACCESS_TOKEN")

async def run_sync():
    # 1. Refresh Token
    token = await refresh_token()
    
    if not token:
        print("❌ Error: No valid access token available.")
        return

    # 2. Init DB
    print("🔄 Initializing database...")
    await init_db()

    # 3. Sync
    print("🚀 Starting sync with Strava...")
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    try:
        async with async_session() as session:
            count = await sync_activities(session, token)
            print(f"✅ Success! Synced {count} activities.")
    except Exception as e:
        print(f"❌ Sync failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_sync())
