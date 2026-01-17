"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function YearSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentYear = new Date().getFullYear();
    const selectedYear = searchParams.get('year') || (currentYear - 1).toString();

    // Generate years from 2020 to current year
    const years = [];
    for (let y = 2020; y <= currentYear; y++) {
        years.push(y);
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = e.target.value;
        router.push(`?year=${year}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-white">Year:</label>
            <select
                id="year-select"
                value={selectedYear}
                onChange={handleChange}
                className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
    );
}
