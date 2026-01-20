import mapboxPolyline from '@mapbox/polyline';
import { StravaActivity } from './chartDataProcessors';

export interface RouteMetadata {
    id: number;
    isNew: boolean;
    visitCount: number;
    color: string;
    opacity: number;
    weight: number;
}

export interface MapBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

/**
 * Calculate the distance between two lat/lng points using Haversine formula
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get the center point of a route
 */
function getRouteCenter(polyline: string): [number, number] | null {
    try {
        const decoded = mapboxPolyline.decode(polyline);
        if (decoded.length === 0) return null;

        // Use middle point of the route
        const midIndex = Math.floor(decoded.length / 2);
        return decoded[midIndex] as [number, number];
    } catch (e) {
        return null;
    }
}

/**
 * Analyze route frequency to determine new vs repeated routes
 * Routes within ~100m of each other are considered the same area
 */
export function analyzeRouteFrequency(activities: StravaActivity[]): Map<number, RouteMetadata> {
    const metadata = new Map<number, RouteMetadata>();
    const PROXIMITY_THRESHOLD = 100; // meters

    // Sort activities by date (oldest first)
    const sortedActivities = [...activities].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    // Track visited areas (center points)
    const visitedAreas: Array<{ lat: number; lng: number; count: number }> = [];

    sortedActivities.forEach(activity => {
        if (!activity.map?.summary_polyline) {
            metadata.set(activity.id, {
                id: activity.id,
                isNew: true,
                visitCount: 1,
                color: '#10b981', // emerald-500
                opacity: 0.8,
                weight: 3
            });
            return;
        }

        const center = getRouteCenter(activity.map.summary_polyline);
        if (!center) {
            metadata.set(activity.id, {
                id: activity.id,
                isNew: true,
                visitCount: 1,
                color: '#10b981',
                opacity: 0.8,
                weight: 3
            });
            return;
        }

        // Check if this area has been visited before
        let nearbyArea = visitedAreas.find(area =>
            haversineDistance(center[0], center[1], area.lat, area.lng) < PROXIMITY_THRESHOLD
        );

        if (nearbyArea) {
            // Repeated area
            nearbyArea.count++;
            metadata.set(activity.id, {
                id: activity.id,
                isNew: false,
                visitCount: nearbyArea.count,
                color: '#6b7280', // gray-500
                opacity: 0.4,
                weight: 2
            });
        } else {
            // New area
            visitedAreas.push({ lat: center[0], lng: center[1], count: 1 });
            metadata.set(activity.id, {
                id: activity.id,
                isNew: true,
                visitCount: 1,
                color: '#10b981', // emerald-500
                opacity: 0.8,
                weight: 3
            });
        }
    });

    return metadata;
}

/**
 * Find the longest run/activity by distance
 */
export function findLongestRun(activities: StravaActivity[]): StravaActivity | null {
    if (activities.length === 0) return null;

    return activities.reduce((longest, current) =>
        current.distance > longest.distance ? current : longest
    );
}

/**
 * Calculate map bounds to fit all activities
 */
export function calculateMapBounds(activities: StravaActivity[]): MapBounds | null {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    let hasValidData = false;

    activities.forEach(activity => {
        if (!activity.map?.summary_polyline) return;

        try {
            const decoded = mapboxPolyline.decode(activity.map.summary_polyline);
            decoded.forEach(([lat, lng]) => {
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                hasValidData = true;
            });
        } catch (e) {
            // Skip invalid polylines
        }
    });

    if (!hasValidData) return null;

    return { minLat, maxLat, minLng, maxLng };
}

/**
 * Get color for route based on metadata
 */
export function getRouteColor(metadata: RouteMetadata, isLongest: boolean): string {
    if (isLongest) {
        return '#f59e0b'; // amber-500 for longest run
    }
    return metadata.color;
}

/**
 * Get weight for route based on metadata
 */
export function getRouteWeight(metadata: RouteMetadata, isLongest: boolean): number {
    if (isLongest) {
        return 4; // Thicker line for longest run
    }
    return metadata.weight;
}

/**
 * Get opacity for route based on metadata
 */
export function getRouteOpacity(metadata: RouteMetadata, isLongest: boolean): number {
    if (isLongest) {
        return 0.9;
    }
    return metadata.opacity;
}
