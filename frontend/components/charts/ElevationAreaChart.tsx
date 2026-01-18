"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StravaActivity, calculateCumulativeElevation } from "@/utils/chartDataProcessors";

interface Props {
    activities: StravaActivity[];
}

export default function ElevationAreaChart({ activities }: Props) {
    const data = calculateCumulativeElevation(activities);

    return (
        <div className="w-full h-80 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Cumulative Elevation Gain (m)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            const parts = value.split('/');
                            return `${parts[1]}/${parts[0]}`; // Short format MM/DD or DD/MM depending on locale, simplifying
                        }}
                        minTickGap={30}
                    />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                    />
                    <Area type="monotone" dataKey="elevation" stroke="#82ca9d" fillOpacity={1} fill="url(#colorElevation)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
