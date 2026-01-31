"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StravaActivity, groupActivitiesByWeek } from "@/utils/chartDataProcessors";

interface Props {
    activities: StravaActivity[];
}

export default function WeeklyVolumeBarChart({ activities }: Props) {
    const data = groupActivitiesByWeek(activities);

    return (
        <div className="w-full h-80 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Weekly Distance (km)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval={4} // Show every 4th label to avoid crowding
                    />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}km`} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                    />
                    <Bar dataKey="distance" fill="#fc4c02" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
