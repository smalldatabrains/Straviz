"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { StravaActivity, formatScatterData } from "@/utils/chartDataProcessors";

interface Props {
    activities: StravaActivity[];
}

export default function IntensityScatterChart({ activities }: Props) {
    const data = formatScatterData(activities);

    return (
        <div className="w-full h-80 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Duration vs. Intensity</h3>
            <p className="text-xs text-zinc-500 mb-4">Distance (km) vs Speed (km/h)</p>
            <ResponsiveContainer width="100%" height="85%">
                <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="distance" name="Distance" unit="km" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="number" dataKey="speed" name="Speed" unit="km/h" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ZAxis type="category" dataKey="name" name="Activity" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                    />
                    <Scatter name="Activities" data={data} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
