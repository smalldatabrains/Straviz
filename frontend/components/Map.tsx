"use client";

import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import mapboxPolyline from '@mapbox/polyline';

interface Activity {
    map: {
        summary_polyline: string;
    };
    name: string;
    id: number;
}

export default function Map({ activities }: { activities: Activity[] }) {
    const positions = activities
        .filter(a => a.map && a.map.summary_polyline)
        .map(a => {
            try {
                return mapboxPolyline.decode(a.map.summary_polyline);
            } catch (e) {
                console.error("Error decoding polyline for activity", a.id, e);
                return null;
            }
        })
        .filter(p => p !== null);

    if (positions.length === 0) {
        return <div className="text-center p-4">No map data available.</div>;
    }

    // Calculate bounds to center the map (simple approach: take first point of first activity)
    const center = positions[0] ? positions[0][0] : [0, 0];

    return (
        <MapContainer center={center as [number, number]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {positions.map((pos, idx) => (
                <Polyline key={idx} positions={pos as [number, number][]} pathOptions={{ color: 'red', weight: 2, opacity: 0.7 }} />
            ))}
        </MapContainer>
    );
}
