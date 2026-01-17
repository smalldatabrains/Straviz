from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import os
import httpx
from services.strava_service import get_strava_data

router = APIRouter(
    prefix="/strava",
    tags=["strava"]
)

from datetime import datetime, timedelta
import time

@router.get("/data")
async def read_strava_data(token: Optional[str] = None, year: Optional[str] = "last_year"):
    try:
        if not token:
            token = os.getenv("STRAVA_ACCESS_TOKEN")
        
        if not token:
             raise HTTPException(status_code=401, detail="No access token provided and STRAVA_ACCESS_TOKEN not set in environment")
        
        params = {"per_page": 200}
        
        if year:
            try:
                if year == "last_year":
                     target_year = datetime.now().year - 1
                else:
                     target_year = int(year)
                
                # Strava API expects epoch timestamps
                start_date = datetime(target_year, 1, 1)
                end_date = datetime(target_year, 12, 31, 23, 59, 59)
                
                params["after"] = int(start_date.timestamp())
                params["before"] = int(end_date.timestamp())
            except ValueError:
                # Fallback or error if year is invalid
                pass

        all_activities = []
        page = 1
        per_page = 200
        
        while True:
            params["page"] = page
            params["per_page"] = per_page
            
            page_data = await get_strava_data(access_token=token, endpoint="/athlete/activities", params=params)
             
            if not page_data:
                break
                
            all_activities.extend(page_data)
            
            if len(page_data) < per_page:
                break
                
            page += 1
            
        return all_activities
    except httpx.HTTPStatusError as e:
        # Pass through the status code and details from Strava
        raise HTTPException(status_code=e.response.status_code, detail=f"Strava API Error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
