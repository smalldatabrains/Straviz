"use client";

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import mapboxPolyline from '@mapbox/polyline';

interface MiniMapProps {
    activity: {
        map: {
            summary_polyline: string;
        };
    };
}

function MapBoundsFitter({ positions }: { positions: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const L = require('leaflet');
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [positions, map]);

    return null;
}

export default function MiniMap({ activity }: MiniMapProps) {
    let positions: [number, number][] = [];

    try {
        positions = mapboxPolyline.decode(activity.map.summary_polyline) as [number, number][];
    } catch (e) {
        console.error("Error decoding polyline", e);
        return <div className="flex items-center justify-center h-full bg-gray-100">Map unavailable</div>;
    }

    if (positions.length === 0) {
        return <div className="flex items-center justify-center h-full bg-gray-100">No route data</div>;
    }

    const center = positions[Math.floor(positions.length / 2)];

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            zoomControl={false}
            dragging={false}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsFitter positions={positions} />
            <Polyline
                positions={positions}
                pathOptions={{
                    color: '#f59e0b',
                    weight: 4,
                    opacity: 0.9
                }}
            />
        </MapContainer>
    );
}
