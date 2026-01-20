"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StravaActivity } from '@/utils/chartDataProcessors';
import { analyzePaceEvolution } from '@/utils/statsCalculations';

export default function PaceEvolutionChart({ activities }: { activities: StravaActivity[] }) {
    const data = analyzePaceEvolution(activities);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center h-80">
                <p className="text-zinc-500">No running activities found</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                Pace Evolution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
                        reversed
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                        formatter={(value: any) => value ? [`${Number(value).toFixed(2)} min/km`, 'Pace'] : ['N/A', 'Pace']}
                    />
                    <Line
                        type="monotone"
                        dataKey="pace"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
