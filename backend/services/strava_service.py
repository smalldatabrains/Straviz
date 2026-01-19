import httpx
import os
from dotenv import load_dotenv

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models import Activity
from datetime import datetime

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

async def sync_activities(session: AsyncSession, access_token: str):
    """
    Fetch all activities from Strava and upsert them into the database.
    """
    # Fetch all activities (loop with pagination)
    all_activities_data = []
    page = 1
    per_page = 200
    params = {"per_page": per_page}

    while True:
        params["page"] = page
        data = await get_strava_data(access_token, params=params)
        if not data:
            break
        all_activities_data.extend(data)
        if len(data) < per_page:
            break
        page += 1
    
    # Process and upsert
    for activity_data in all_activities_data:
        # Check if exists
        activity_id = activity_data.get("id")
        statement = select(Activity).where(Activity.id == activity_id)
        result = await session.exec(statement)
        existing_activity = result.first()
        
        # Prepare data dict (filter keys that match our model)
        # Note: We need to handle map separately because it's a nested object in Strava response
        map_data = activity_data.get("map", {})
        
        # Parse dates
        start_date = datetime.strptime(activity_data.get("start_date"), "%Y-%m-%dT%H:%M:%SZ")
        start_date_local = datetime.strptime(activity_data.get("start_date_local"), "%Y-%m-%dT%H:%M:%SZ")

        activity_obj = Activity(
            id=activity_id,
            name=activity_data.get("name"),
            distance=activity_data.get("distance"),
            moving_time=activity_data.get("moving_time"),
            elapsed_time=activity_data.get("elapsed_time"),
            total_elevation_gain=activity_data.get("total_elevation_gain"),
            type=activity_data.get("type"),
            sport_type=activity_data.get("sport_type"),
            start_date=start_date,
            start_date_local=start_date_local,
            timezone=activity_data.get("timezone"),
            utc_offset=activity_data.get("utc_offset"),
            map_polyline=map_data.get("polyline"),
            map_summary_polyline=map_data.get("summary_polyline"),
            average_speed=activity_data.get("average_speed"),
            max_speed=activity_data.get("max_speed"),
            average_heartrate=activity_data.get("average_heartrate"),
            max_heartrate=activity_data.get("max_heartrate"),
            elev_high=activity_data.get("elev_high"),
            elev_low=activity_data.get("elev_low")
        )

        if existing_activity:
            # Update existing
            for key, value in activity_obj.dict(exclude_unset=True).items():
                setattr(existing_activity, key, value)
            session.add(existing_activity)
        else:
            # Create new
            session.add(activity_obj)
    
    await session.commit()
    return len(all_activities_data)

