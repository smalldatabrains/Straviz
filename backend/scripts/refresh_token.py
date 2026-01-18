import os
import httpx
import asyncio
from dotenv import load_dotenv

# Load env from parent directory (backend/.env)
current_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_dir)
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

client_id = os.getenv("STRAVA_CLIENT_ID")
client_secret = os.getenv("STRAVA_CLIENT_SECRET")
refresh_token = os.getenv("STRAVA_REFRESH_TOKEN")

if not all([client_id, client_secret, refresh_token]):
    print("Missing credentials in .env")
    print(f"ID: {client_id}, Secret: {client_secret}, Refresh: {refresh_token}")
    exit(1)

async def refresh():
    url = "https://www.strava.com/oauth/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    
    print(f"Attempting to refresh token for Client ID: {client_id}...")
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=data)
        if resp.status_code == 200:
            new_tokens = resp.json()
            access_token = new_tokens.get("access_token")
            new_refresh = new_tokens.get("refresh_token")
            print(f"Success! New Access Token: {access_token[:10]}...")
            
            # Update .env
            # We explicitly write the lines to preserve format or just overwrite
            content = f"STRAVA_CLIENT_ID={client_id}\n"
            content += f"STRAVA_CLIENT_SECRET={client_secret}\n"
            content += f"STRAVA_REFRESH_TOKEN={new_refresh}\n"
            content += f"STRAVA_ACCESS_TOKEN={access_token}\n"
            
            with open(env_path, "w") as f:
                f.write(content)
            print(f"Updated {env_path} successfully.")
        else:
            print(f"Failed to refresh: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    asyncio.run(refresh())
