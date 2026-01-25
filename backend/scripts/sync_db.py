import asyncio
import os
import sys

# Add the parent directory to sys.path so we can import from database and services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from services.strava_service import sync_activities
from dotenv import load_dotenv

async def run_sync():
    # Ensure .env is loaded
    load_dotenv()
    
    token = os.getenv("STRAVA_ACCESS_TOKEN")
    if not token:
        print("❌ Error: STRAVA_ACCESS_TOKEN not found in environment.")
        return

    print("🔄 Initializing database...")
    await init_db()

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
