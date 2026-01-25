import Link from 'next/link';
import YearSelector from './YearSelector';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-gray-900 text-white p-4">
                <nav className="flex justify-between max-w-5xl mx-auto w-full items-center">
                    <div className="font-bold text-xl">Straviz</div>
                    <div className="flex gap-8 items-center">
                        <ul className="flex gap-4">
                            <li><Link href="/" className="hover:text-blue-400">Map</Link></li>
                            <li><Link href="/stats" className="hover:text-blue-400">Statistics</Link></li>
                        </ul>
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
