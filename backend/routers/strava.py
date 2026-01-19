from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
import os
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from database import get_session
from models import Activity
from services.strava_service import sync_activities
from datetime import datetime

router = APIRouter(
    prefix="/strava",
    tags=["strava"]
)

@router.post("/sync")
async def sync_strava_data(
    session: AsyncSession = Depends(get_session)
):
    token = os.getenv("STRAVA_ACCESS_TOKEN")
    if not token:
        raise HTTPException(status_code=401, detail="STRAVA_ACCESS_TOKEN not set")
    
    try:
        count = await sync_activities(session, token)
        return {"message": f"Synced {count} activities"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/data")
async def read_strava_data(
    year: Optional[str] = "last_year",
    session: AsyncSession = Depends(get_session)
):
    try:
        query = select(Activity)
        
        if year:
            try:
                if year == "last_year":
                     target_year = datetime.now().year - 1
                else:
                     target_year = int(year)
                
                start_date = datetime(target_year, 1, 1)
                end_date = datetime(target_year, 12, 31, 23, 59, 59)
                
                query = query.where(Activity.start_date >= start_date, Activity.start_date <= end_date)
            except ValueError:
                pass

        result = await session.exec(query)
        activities = result.all()
        
        # Transform to match frontend expectations (nested map object)
        transformed = []
        for activity in activities:
            activity_dict = activity.dict()
            # Restructure map data to nested format
            activity_dict["map"] = {
                "polyline": activity_dict.pop("map_polyline"),
                "summary_polyline": activity_dict.pop("map_summary_polyline")
            }
            transformed.append(activity_dict)
        
        return transformed

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
