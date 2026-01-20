import { StravaActivity } from './chartDataProcessors';
import { analyzeRouteFrequency } from './routeAnalysis';

export interface CumulativeDataPoint {
    date: string;
    distance: number;
}

export interface PaceDataPoint {
    date: string;
    pace: number; // minutes per km
    month: string;
}

export interface TimeOfDayData {
    name: string;
    value: number;
    color: string;
}

export interface NewVsRepeatedData {
    month: string;
    new: number;
    repeated: number;
}

export interface PersonalizedSummary {
    totalDistance: number;
    totalActivities: number;
    longestRun: number;
    favoriteMonth: string;
    totalElevation: number;
    newAreasExplored: number;
}

/**
 * Calculate cumulative distance over time
 */
export function calculateCumulativeDistance(activities: StravaActivity[]): CumulativeDataPoint[] {
    // Sort by date ascending
    const sorted = [...activities].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    let cumulative = 0;
    const data: CumulativeDataPoint[] = [];

    sorted.forEach(activity => {
        cumulative += activity.distance / 1000; // Convert to km
        data.push({
            date: new Date(activity.start_date_local).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            distance: Math.round(cumulative * 10) / 10
        });
    });

    return data;
}

/**
 * Analyze pace evolution over time
 */
export function analyzePaceEvolution(activities: StravaActivity[]): PaceDataPoint[] {
    // Filter only running activities and those with valid pace
    const runningActivities = activities.filter(a =>
        (a.type === 'Run' || a.type === 'Running') &&
        a.distance > 0 &&
        a.moving_time > 0
    );

    // Sort by date
    const sorted = [...runningActivities].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const data: PaceDataPoint[] = [];
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    sorted.forEach(activity => {
        // Calculate pace: minutes per km
        const distanceKm = activity.distance / 1000;
        const timeMinutes = activity.moving_time / 60;
        const pace = timeMinutes / distanceKm;

        const date = new Date(activity.start_date_local);

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            pace: Math.round(pace * 10) / 10,
            month: months[date.getMonth()]
        });
    });

    return data;
}

/**
 * Categorize activities by time of day
 */
export function categorizeTimeOfDay(activities: StravaActivity[]): TimeOfDayData[] {
    const categories = {
        morning: { count: 0, color: '#fbbf24' },    // amber-400
        afternoon: { count: 0, color: '#f59e0b' },  // amber-500
        evening: { count: 0, color: '#d97706' },    // amber-600
        night: { count: 0, color: '#92400e' }       // amber-900
    };

    activities.forEach(activity => {
        const date = new Date(activity.start_date_local);
        const hour = date.getHours();

        if (hour >= 5 && hour < 12) {
            categories.morning.count++;
        } else if (hour >= 12 && hour < 17) {
            categories.afternoon.count++;
        } else if (hour >= 17 && hour < 21) {
            categories.evening.count++;
        } else {
            categories.night.count++;
        }
    });

    return [
        { name: 'Morning (5am-12pm)', value: categories.morning.count, color: categories.morning.color },
        { name: 'Afternoon (12pm-5pm)', value: categories.afternoon.count, color: categories.afternoon.color },
        { name: 'Evening (5pm-9pm)', value: categories.evening.count, color: categories.evening.color },
        { name: 'Night (9pm-5am)', value: categories.night.count, color: categories.night.color }
    ].filter(item => item.value > 0); // Only include categories with activities
}

/**
 * Analyze new vs repeated routes by month
 */
export function analyzeNewVsRepeatedByMonth(activities: StravaActivity[]): NewVsRepeatedData[] {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyData: NewVsRepeatedData[] = months.map(month => ({
        month,
        new: 0,
        repeated: 0
    }));

    const routeMetadata = analyzeRouteFrequency(activities);

    activities.forEach(activity => {
        const date = new Date(activity.start_date_local);
        const monthIndex = date.getMonth();
        const metadata = routeMetadata.get(activity.id);

        if (metadata) {
            if (metadata.isNew) {
                monthlyData[monthIndex].new++;
            } else {
                monthlyData[monthIndex].repeated++;
            }
        }
    });

    return monthlyData;
}

/**
 * Generate personalized summary statistics
 */
export function generatePersonalizedSummary(activities: StravaActivity[]): PersonalizedSummary {
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000; // km
    const totalActivities = activities.length;
    const longestRun = Math.max(...activities.map(a => a.distance)) / 1000; // km
    const totalElevation = activities.reduce((sum, a) => sum + a.total_elevation_gain, 0);

    // Find favorite month (most activities)
    const monthCounts = new Array(12).fill(0);
    activities.forEach(activity => {
        const month = new Date(activity.start_date_local).getMonth();
        monthCounts[month]++;
    });
    const favoriteMonthIndex = monthCounts.indexOf(Math.max(...monthCounts));
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const favoriteMonth = monthNames[favoriteMonthIndex];

    // Count new areas explored
    const routeMetadata = analyzeRouteFrequency(activities);
    const newAreasExplored = Array.from(routeMetadata.values()).filter(m => m.isNew).length;

    return {
        totalDistance: Math.round(totalDistance),
        totalActivities,
        longestRun: Math.round(longestRun * 10) / 10,
        favoriteMonth,
        totalElevation: Math.round(totalElevation),
        newAreasExplored
    };
}
