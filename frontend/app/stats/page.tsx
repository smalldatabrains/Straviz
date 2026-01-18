"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';

import ActivityTypePieChart from '@/components/charts/ActivityTypePieChart';
import MonthlyVolumeBarChart from '@/components/charts/MonthlyVolumeBarChart';
import ElevationAreaChart from '@/components/charts/ElevationAreaChart';
import IntensityScatterChart from '@/components/charts/IntensityScatterChart';
import ActivityHeatmap from '@/components/charts/ActivityHeatmap';

function StatsContent() {
    const searchParams = useSearchParams();
    const year = searchParams.get('year') || 'last_year';

    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const apiUrl = '/api';
            const res = await fetch(`${apiUrl}/strava/data?year=${year}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || `Error ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            setActivities(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [year]);

    return (
        <div className="flex flex-col items-center p-6 w-full max-w-[1600px] mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Statistics Dashboard</h1>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <span className="text-lg text-zinc-500 animate-pulse">Loading stats...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <div className="w-full space-y-6">
                    {/* Top Row: Key Metrics & Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ActivityTypePieChart activities={activities} />
                        <MonthlyVolumeBarChart activities={activities} />
                        <ElevationAreaChart activities={activities} />
                    </div>

                    {/* Middle Row: Deep Dives */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <IntensityScatterChart activities={activities} />
                        {/* Placeholder for future expansion or another metric, 
                            using Heatmap spanning full width below instead for better visual balance */}
                        <div className="h-80 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Summary</h3>
                            <div className="grid grid-cols-2 gap-8 mt-4">
                                <div>
                                    <p className="text-sm text-zinc-500">Total Activities</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{activities.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Total Distance</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {(activities.reduce((acc, curr) => acc + curr.distance, 0) / 1000).toFixed(0)} <span className="text-base font-normal text-zinc-500">km</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Frequency */}
                    <ActivityHeatmap activities={activities} />

                </div>
            )}
        </div>
    );
}

export default function StatsPage() {
    return (
        <Layout>
            <Suspense fallback={<div>Loading stats...</div>}>
                <StatsContent />
            </Suspense>
        </Layout>
    );
}
