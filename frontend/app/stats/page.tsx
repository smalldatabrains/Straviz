"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';

import ActivityTypePieChart from '@/components/charts/ActivityTypePieChart';
import MonthlyVolumeBarChart from '@/components/charts/MonthlyVolumeBarChart';
import ElevationAreaChart from '@/components/charts/ElevationAreaChart';
import IntensityScatterChart from '@/components/charts/IntensityScatterChart';
import ActivityHeatmap from '@/components/charts/ActivityHeatmap';
import CumulativeDistanceChart from '@/components/charts/CumulativeDistanceChart';
import PaceEvolutionChart from '@/components/charts/PaceEvolutionChart';
import TimeOfDayChart from '@/components/charts/TimeOfDayChart';
import NewVsRepeatedChart from '@/components/charts/NewVsRepeatedChart';
import LongestRunCard from '@/components/charts/LongestRunCard';
import PersonalizedSummaryCard from '@/components/charts/PersonalizedSummaryCard';

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
            <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Statistics Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">Your year in data and insights</p>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <span className="text-lg text-zinc-500 animate-pulse">Loading stats...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <div className="w-full space-y-8">
                    {/* Hero Section: Personalized Summary */}
                    <section>
                        <PersonalizedSummaryCard activities={activities} />
                    </section>

                    {/* Activity Overview Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Activity Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ActivityTypePieChart activities={activities} />
                            <MonthlyVolumeBarChart activities={activities} />
                            <TimeOfDayChart activities={activities} />
                        </div>
                    </section>

                    {/* Performance Metrics Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Performance Metrics</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CumulativeDistanceChart activities={activities} />
                            <ElevationAreaChart activities={activities} />
                            <PaceEvolutionChart activities={activities} />
                            <IntensityScatterChart activities={activities} />
                        </div>
                    </section>

                    {/* Exploration Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Exploration & Highlights</h2>
                        <div className="space-y-6">
                            <LongestRunCard activities={activities} />
                            <NewVsRepeatedChart activities={activities} />
                        </div>
                    </section>

                    {/* Activity Frequency Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Activity Frequency</h2>
                        <ActivityHeatmap activities={activities} />
                    </section>

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
