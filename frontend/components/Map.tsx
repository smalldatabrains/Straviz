"use client";

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import mapboxPolyline from '@mapbox/polyline';
import {
    analyzeRouteFrequency,
    findLongestRun,
    calculateMapBounds,
    getRouteColor,
    getRouteWeight,
    getRouteOpacity
} from '../utils/routeAnalysis';

interface Activity {
    map: {
        summary_polyline: string;
    };
    name: string;
    id: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    start_date: string;
    start_date_local: string;
    average_speed: number;
}

interface DecodedRoute {
    positions: [number, number][];
    activityId: number;
    color: string;
    weight: number;
    opacity: number;
}

// Component to handle map bounds fitting
function MapBoundsFitter({ bounds }: { bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null }) {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            const L = require('leaflet');
            const corner1 = L.latLng(bounds.minLat, bounds.minLng);
            const corner2 = L.latLng(bounds.maxLat, bounds.maxLng);
            const mapBounds = L.latLngBounds(corner1, corner2);
            map.fitBounds(mapBounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    return null;
}

export default function Map({ activities }: { activities: Activity[] }) {
    // Analyze routes and find longest run
    const routeMetadata = useMemo(() => analyzeRouteFrequency(activities), [activities]);
    const longestRun = useMemo(() => findLongestRun(activities), [activities]);
    const bounds = useMemo(() => calculateMapBounds(activities), [activities]);

    // Decode polylines and apply styling
    const decodedRoutes = useMemo(() => {
        const routes: DecodedRoute[] = [];

        activities.forEach(activity => {
            if (!activity.map?.summary_polyline) return;

            try {
                const positions = mapboxPolyline.decode(activity.map.summary_polyline) as [number, number][];
                const metadata = routeMetadata.get(activity.id);
                const isLongest = longestRun?.id === activity.id;

                if (metadata) {
                    routes.push({
                        positions,
                        activityId: activity.id,
                        color: getRouteColor(metadata, isLongest),
                        weight: getRouteWeight(metadata, isLongest),
                        opacity: getRouteOpacity(metadata, isLongest)
                    });
                }
            } catch (e) {
                console.error("Error decoding polyline for activity", activity.id, e);
            }
        });

        return routes;
    }, [activities, routeMetadata, longestRun]);

    if (decodedRoutes.length === 0) {
        return <div className="text-center p-4">No map data available.</div>;
    }

    // Calculate center from bounds or use first route
    const center: [number, number] = bounds
        ? [(bounds.minLat + bounds.maxLat) / 2, (bounds.minLng + bounds.maxLng) / 2]
        : decodedRoutes[0].positions[0];

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBoundsFitter bounds={bounds} />
                {decodedRoutes.map((route, idx) => (
                    <Polyline
                        key={`${route.activityId}-${idx}`}
                        positions={route.positions}
                        pathOptions={{
                            color: route.color,
                            weight: route.weight,
                            opacity: route.opacity
                        }}
                    />
                ))}
            </MapContainer>


            {/* Legend */}
            <div className="absolute bottom-8 right-8 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Route Legend</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-emerald-500 rounded"></div>
                        <span className="text-zinc-700 dark:text-zinc-300">New routes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-gray-500 opacity-40 rounded"></div>
                        <span className="text-zinc-700 dark:text-zinc-300">Repeated routes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-amber-500 rounded"></div>
                        <span className="text-zinc-700 dark:text-zinc-300">Longest run</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
