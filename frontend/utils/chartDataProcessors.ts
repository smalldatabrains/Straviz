
export interface StravaActivity {
    id: number;
    name: string;
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time: number; // seconds
    total_elevation_gain: number; // meters
    type: string;
    start_date: string;
    start_date_local: string;
    average_speed: number; // meters/second
    map?: {
        summary_polyline: string;
    };
}

// 1. Activity Type Breakdown (Pie Chart)
export const groupActivitiesByType = (activities: StravaActivity[]) => {
    const typeCount: Record<string, number> = {};
    activities.forEach((activity) => {
        const type = activity.type;
        typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.keys(typeCount).map((type) => ({
        name: type,
        value: typeCount[type],
    }));
};

// 2. Monthly Volume (Bar Chart)
export const groupActivitiesByMonth = (activities: StravaActivity[]) => {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyData = Array(12).fill(0).map((_, i) => ({
        name: months[i],
        distance: 0, // km
    }));

    activities.forEach((activity) => {
        const date = new Date(activity.start_date_local);
        const monthIndex = date.getMonth(); // 0-11
        // Convert meters to km
        monthlyData[monthIndex].distance += activity.distance / 1000;
    });

    // Round to 1 decimal
    return monthlyData.map(d => ({
        ...d,
        distance: Math.round(d.distance * 10) / 10
    }));
};

// 3. Cumulative Elevation Gain (Area Chart)
export const calculateCumulativeElevation = (activities: StravaActivity[]) => {
    // Sort by date ascending
    const sorted = [...activities].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    let cumulative = 0;
    const data: { date: string; elevation: number }[] = [];

    sorted.forEach(activity => {
        cumulative += activity.total_elevation_gain;
        data.push({
            date: new Date(activity.start_date_local).toLocaleDateString(),
            elevation: Math.round(cumulative)
        });
    });

    return data;
};

// 4. Duration vs Intensity (Scatter Plot)
export const formatScatterData = (activities: StravaActivity[]) => {
    return activities.map(activity => ({
        id: activity.id,
        // x: distance in km
        distance: parseFloat((activity.distance / 1000).toFixed(2)),
        // y: speed in km/h (m/s * 3.6)
        speed: parseFloat((activity.average_speed * 3.6).toFixed(1)),
        name: activity.name,
        type: activity.type
    }));
};

// 5. Heatmap Data
// We need a map of 'YYYY-MM-DD' -> count or value
export const formatHeatmapData = (activities: StravaActivity[]) => {
    const dateMap: Record<string, number> = {};

    activities.forEach(activity => {
        const dateStr = activity.start_date_local.split('T')[0];
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1; // Count activities
        // Alternatively, use distance: dateMap[dateStr] = (dateMap[dateStr] || 0) + activity.distance;
    });

    return dateMap;
};
