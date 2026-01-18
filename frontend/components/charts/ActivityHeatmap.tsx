"use client";

import { StravaActivity, formatHeatmapData } from "@/utils/chartDataProcessors";

interface Props {
    activities: StravaActivity[];
}

export default function ActivityHeatmap({ activities }: Props) {
    const dateMap = formatHeatmapData(activities);

    // Create a 52-week grid (approximate) or simple recent-days grid
    // For simplicity and effectiveness, let's show the last 365 days in a contribution-like grid.

    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setDate(today.getDate() - 365);

    // Generate days array
    const days = [];
    let current = new Date(yearAgo);

    while (current <= today) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // Determine intensity helper
    const getIntensity = (count: number) => {
        if (!count) return "bg-zinc-100 dark:bg-zinc-800";
        if (count === 1) return "bg-orange-200 dark:bg-orange-900";
        if (count === 2) return "bg-orange-400 dark:bg-orange-700";
        if (count >= 3) return "bg-blue-600 dark:bg-orange-500"; // Mixing it up
        return "bg-orange-600";
    };

    // Re-map for better colors: light orange -> dark orange
    const getColor = (count: number) => {
        if (count === 0) return "bg-zinc-200 dark:bg-zinc-800";
        if (count >= 1 && count <= 2) return "bg-orange-300 dark:bg-orange-800";
        if (count > 2) return "bg-orange-500 dark:bg-orange-600";
        return "bg-zinc-200"; // fallback
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Activity Frequency</h3>

            <div className="flex flex-col gap-1 min-w-[800px]">
                {/* We can construct a grid where columns are weeks, rows are days of week */}
                <div className="flex gap-1">
                    {/* Simple visualization: just a long flex wrap or grid is hard to align like GitHub without complex math.
                 Let's do a simple flex wrap for now, or true SVG.
                 Trying CSS Grid for 53 columns, 7 rows.
              */}
                    <div
                        className="grid gap-[2px]"
                        style={{
                            gridTemplateColumns: `repeat(53, 1fr)`,
                            gridTemplateRows: `repeat(7, 1fr)`,
                            gridAutoFlow: "column"
                        }}
                    >
                        {days.map((date, i) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const count = dateMap[dateStr] || 0;

                            return (
                                <div
                                    key={i}
                                    title={`${dateStr}: ${count} activities`}
                                    className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                                />
                            )
                        })}
                    </div>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 mt-2 px-1">
                    <span>Less</span>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
