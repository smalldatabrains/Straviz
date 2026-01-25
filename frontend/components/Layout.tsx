import NavLink from './NavLink';
import YearSelector from './YearSelector';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-gray-900 text-white p-4">
                <nav className="flex justify-between max-w-5xl mx-auto w-full items-center">
                    <div className="font-bold text-xl">Straviz</div>
                    <div className="flex gap-8 items-center">
                        <Suspense fallback={<div>Loading...</div>}>
                            <ul className="flex gap-4">
                                <li><NavLink href="/" className="hover:text-blue-400">Map</NavLink></li>
                                <li><NavLink href="/stats" className="hover:text-blue-400">Statistics</NavLink></li>
                            </ul>
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
