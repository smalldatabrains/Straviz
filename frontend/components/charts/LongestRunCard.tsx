"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { StravaActivity } from '@/utils/chartDataProcessors';
import { findLongestRun } from '@/utils/routeAnalysis';

// Dynamically import Map component with no SSR
const MiniMap = dynamic<{ activity: { map: { summary_polyline: string } } }>(
    () => import('./MiniMap'),
    { ssr: false }
);

export default function LongestRunCard({ activities }: { activities: StravaActivity[] }) {
    const longestRun = useMemo(() => findLongestRun(activities), [activities]);

    if (!longestRun) {
        return null;
    }

    const distanceKm = (longestRun.distance / 1000).toFixed(2);
    const date = new Date(longestRun.start_date_local).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const elevationM = Math.round(longestRun.total_elevation_gain);
    const durationMin = Math.round(longestRun.moving_time / 60);

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-6 rounded-xl shadow-lg border-2 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    Longest Run of the Year
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Stats */}
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Distance</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                            {distanceKm} <span className="text-lg font-normal">km</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Date</p>
                        <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">{date}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-300">Elevation</p>
                            <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{elevationM}m</p>
                        </div>
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-300">Duration</p>
                            <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{durationMin}min</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Activity Name</p>
                        <p className="text-md font-medium text-amber-900 dark:text-amber-100 italic">"{longestRun.name}"</p>
                    </div>
                </div>

                {/* Mini Map */}
                <div className="h-64 rounded-lg overflow-hidden border-2 border-amber-300 dark:border-amber-700">
                    {longestRun.map?.summary_polyline && (
                        <MiniMap activity={longestRun as any} />
                    )}
                </div>
            </div>
        </div>
    );
}
