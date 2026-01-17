import httpx
import os
from dotenv import load_dotenv

load_dotenv()

STRAVA_API_URL = "https://www.strava.com/api/v3"

async def get_strava_data(access_token: str, endpoint: str = "/athlete/activities", params: dict = None):
    """
    Retrieve data from Strava API.
    
    Args:
        access_token (str): Strava access token.
        endpoint (str): Strava API endpoint (default: /athlete/activities).
        params (dict, optional): Query parameters.
        
    Returns:
        dict: JSON response from Strava API.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{STRAVA_API_URL}{endpoint}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
