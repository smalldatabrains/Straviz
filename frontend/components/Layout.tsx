import Link from 'next/link';
import YearSelector from './YearSelector';
import { Suspense, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage("");
        try {
            const res = await fetch('/api/strava/sync', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setSyncMessage(`✅ ${data.message}`);
                // Refresh data if we are on the home or stats page
                window.location.reload();
            } else {
                throw new Error(data.detail || "Sync failed");
            }
        } catch (err: any) {
            setSyncMessage(`❌ ${err.message}`);
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-gray-900 text-white p-4">
                <nav className="flex justify-between max-w-5xl mx-auto w-full items-center">
                    <div className="flex items-center gap-6">
                        <div className="font-bold text-xl">Straviz</div>
                        <ul className="flex gap-4">
                            <li><Link href="/" className="hover:text-blue-400">Map</Link></li>
                            <li><Link href="/stats" className="hover:text-blue-400">Statistics</Link></li>
                        </ul>
                    </div>
                    <div className="flex gap-4 items-center">
                        {syncMessage && <span className="text-sm text-gray-300">{syncMessage}</span>}
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isSyncing
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                        >
                            {isSyncing ? 'Syncing...' : 'Sync Data'}
                        </button>
                        <Suspense fallback={<div>Loading...</div>}>
                            <YearSelector />
                        </Suspense>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}
