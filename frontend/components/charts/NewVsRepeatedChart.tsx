"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StravaActivity } from '@/utils/chartDataProcessors';
import { analyzeNewVsRepeatedByMonth } from '@/utils/statsCalculations';

export default function NewVsRepeatedChart({ activities }: { activities: StravaActivity[] }) {
    const data = analyzeNewVsRepeatedByMonth(activities);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                New vs Repeated Routes by Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        label={{ value: 'Activities', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="new" stackId="a" fill="#10b981" name="New Routes" />
                    <Bar dataKey="repeated" stackId="a" fill="#6b7280" name="Repeated Routes" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
