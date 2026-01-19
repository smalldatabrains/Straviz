from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import BigInteger, Column
from datetime import datetime

class Activity(SQLModel, table=True):
    id: int = Field(default=None, sa_column=Column(BigInteger(), primary_key=True))
    name: str
    distance: float
    moving_time: int = Field(sa_column=Column(BigInteger()))
    elapsed_time: int = Field(sa_column=Column(BigInteger()))
    total_elevation_gain: float
    type: str
    sport_type: str
    start_date: datetime
    start_date_local: datetime
    timezone: str
    utc_offset: float
    map_polyline: Optional[str] = None
    map_summary_polyline: Optional[str] = None
    
    # Optional fields that might be useful
    average_speed: Optional[float] = None
    max_speed: Optional[float] = None
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[float] = None
    elev_high: Optional[float] = None
    elev_low: Optional[float] = None
