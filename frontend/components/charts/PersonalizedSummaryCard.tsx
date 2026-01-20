"use client";

import { useMemo } from 'react';
import { StravaActivity } from '@/utils/chartDataProcessors';
import { generatePersonalizedSummary } from '@/utils/statsCalculations';

export default function PersonalizedSummaryCard({ activities }: { activities: StravaActivity[] }) {
    const summary = useMemo(() => generatePersonalizedSummary(activities), [activities]);

    const summaryTexts = [
        `This year, you ran ${summary.totalDistance.toLocaleString()} km.`,
        `You explored ${summary.newAreasExplored} new areas.`,
        `Your longest run was ${summary.longestRun} km.`,
        `Your favorite month was ${summary.favoriteMonth}.`,
        `You climbed ${summary.totalElevation.toLocaleString()} meters.`
    ];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-8 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Your Year in Review
                </h3>
            </div>

            <div className="space-y-4">
                {summaryTexts.map((text, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm"
                    >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                        </span>
                        <p className="text-lg text-blue-900 dark:text-blue-100 font-medium">
                            {text}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Total Activities</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summary.totalActivities}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Total Distance</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {summary.totalDistance} <span className="text-lg">km</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
