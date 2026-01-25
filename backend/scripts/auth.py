import webbrowser
import uvicorn
from fastapi import FastAPI, Request
import httpx
import asyncio
import os
import sys

# Try to get Client ID/Secret from args or input
print("To get a token with 'activity:read_all' scope, we need your Client ID and Client Secret.")
print("You can find these at https://www.strava.com/settings/api under 'My API Application'.")
print("---------------------------------------------------------------------------------------")

client_id = input("Enter Client ID: ").strip()
client_secret = input("Enter Client Secret: ").strip()

app = FastAPI()
done_event = asyncio.Event()

@app.get("/")
async def auth_callback(code: str = None, error: str = None):
    if error:
        return f"Error: {error}"
    if not code:
        return "No code received."
    
    # Exchange code for token
    token_url = "https://www.strava.com/oauth/token"
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(token_url, data=payload)
            resp.raise_for_status()
            data = resp.json()
            access_token = data.get("access_token")
            refresh_token = data.get("refresh_token")
            
            # Print to console
            print("\nSUCCESS! Here is your new Access Token:")
            print(f"STRAVA_ACCESS_TOKEN={access_token}")
            print("\n(You can also use the refresh token to get new ones later if needed)")
            
            # Write to .env
            env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
            with open(env_path, "w") as f:
                f.write(f"STRAVA_ACCESS_TOKEN={access_token}\n")
            print(f"Updated {env_path}")
            
            done_event.set()
            return "Token generated! Check your terminal. You can close this tab."
        except Exception as e:
            return f"Error exchanging token: {e}"

async def run_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8080, log_level="error")
    server = uvicorn.Server(config)
    await server.serve()

def main():
    redirect_uri = "http://localhost:8080"
    auth_url = (
        f"https://www.strava.com/oauth/authorize?"
        f"client_id={client_id}&response_type=code&"
        f"redirect_uri={redirect_uri}&approval_prompt=force&"
        f"scope=activity:read_all"
    )
    
    print(f"\nOpening browser to: {auth_url}")
    webbrowser.open(auth_url)
    
    # Run server until done
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run_server())

if __name__ == "__main__":
    # Hack to allow uvicorn to run from this script without complex async handling
    # We'll just run uvicorn in a way that respects the event
    # Actually, simplistic approach: run uvicorn, and in the handler, print and exit?
    # uvicorn.run is blocking. We can't easily shutdown from inside without access to server instance.
    # Let's just use a simple server instead of FastAPI for a script? 
    # No, FastAPI is installed. Let's stick to it but accept we might need to CTRL+C.
    # Actually, we can use the `shutdown` logic.
    pass


# Redefining logic to be simpler for a script run by user
import http.server
import socketserver
import urllib.parse
import os
import requests
import threading
import contextlib
from dotenv import load_dotenv

# Load existing .env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
load_dotenv(env_path)

print("To get a token with 'activity:read_all' scope, we need your Client ID and Client Secret.")
print("You can find these at https://www.strava.com/settings/api under 'My API Application'.")
print("---------------------------------------------------------------------------------------")

client_id = os.getenv("STRAVA_CLIENT_ID")
if not client_id:
    client_id = input("Enter Client ID: ").strip()

client_secret = os.getenv("STRAVA_CLIENT_SECRET")
if not client_secret:
    client_secret = input("Enter Client Secret: ").strip()

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        
        if "code" in params:
            code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h1>Token received! Check your terminal.</h1>")
            
            # Exchange
            print(f"Code received: {code}")
            
            res = requests.post("https://www.strava.com/oauth/token", data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code"
            })
            
            if res.ok:
                data = res.json()
                token = data['access_token']
                refresh_token = data['refresh_token']
                
                print(f"\n\n>>> NEW TOKEN: {token} <<<\n")
                
                # Write all vars to .env
                with open(env_path, "w") as f:
                    f.write(f"STRAVA_ACCESS_TOKEN={token}\n")
                    f.write(f"STRAVA_REFRESH_TOKEN={refresh_token}\n")
                    f.write(f"STRAVA_CLIENT_ID={client_id}\n")
                    f.write(f"STRAVA_CLIENT_SECRET={client_secret}\n")
                    
                print(f"Updated {env_path} with new tokens and credentials.")
            else:
                 print(f"Error: {res.text}")

            # Exit
            threading.Thread(target=self.server.shutdown).start()

PORT = 8080
redirect_uri = f"http://localhost:{PORT}"
auth_url = (
    f"https://www.strava.com/oauth/authorize?"
    f"client_id={client_id}&response_type=code&"
    f"redirect_uri={redirect_uri}&approval_prompt=force&"
    f"scope=activity:read_all"
)

print(f"\nOpening browser to authorize...")
webbrowser.open(auth_url)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Listening at {redirect_uri}")
    httpd.serve_forever()
