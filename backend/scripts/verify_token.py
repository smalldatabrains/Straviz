import os
import httpx
import asyncio
from dotenv import load_dotenv

# Load env from parent directory (backend/.env)
current_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_dir)
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

access_token = os.getenv("STRAVA_ACCESS_TOKEN")

async def verify():
    print(f"Checking token: {access_token[:10]}...")
    url = "https://www.strava.com/api/v3/athlete/activities?per_page=1"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 200:
            print("Token is VALID! API returned 200 OK.")
            print(f"Data sample: {str(resp.json())[:100]}...")
        else:
            print(f"Token is INVALID. Status: {resp.status_code}")
            print(f"Response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(verify())
