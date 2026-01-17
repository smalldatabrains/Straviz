"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatsContent() {
    const searchParams = useSearchParams();
    const year = searchParams.get('year') || 'last_year';

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/strava/data?year=${year}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || `Error ${res.status}: ${res.statusText}`);
            }
            const activities = await res.json();
            processData(activities);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const processData = (activities: any[]) => {
        // Sort by date
        const sorted = activities.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        let cumDist = 0;
        let cumElev = 0;

        const chartData = sorted.map(act => {
            cumDist += (act.distance / 1000); // meters to km
            cumElev += act.total_elevation_gain;
            return {
                date: new Date(act.start_date).toLocaleDateString(),
                distance: parseFloat(cumDist.toFixed(2)),
                elevation: Math.round(cumElev)
            };
        });

        setData(chartData);
    };

    useEffect(() => {
        fetchActivities();
    }, [year]);

    return (
        <div className="flex flex-col items-center p-4 w-full">
            <h1 className="text-3xl font-bold mb-8">Cumulative Statistics</h1>

            {loading ? (
                <div>Loading stats...</div>
            ) : error ? (
                <div className="text-red-500">Error: {error}</div>
            ) : (
                <div className="w-full max-w-6xl space-y-12">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-white">Cumulative Distance (km)</h2>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#ccc" />
                                    <YAxis stroke="#ccc" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }} />
                                    <Area type="monotone" dataKey="distance" stroke="#8884d8" fillOpacity={1} fill="url(#colorDist)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-white">Cumulative Elevation Gain (m)</h2>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#ccc" />
                                    <YAxis stroke="#ccc" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }} />
                                    <Area type="monotone" dataKey="elevation" stroke="#82ca9d" fillOpacity={1} fill="url(#colorElev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
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
