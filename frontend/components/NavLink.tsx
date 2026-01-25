"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export default function NavLink({ href, children, className }: NavLinkProps) {
    const searchParams = useSearchParams();
    const year = searchParams.get('year');

    // Append year to href if it exists
    const newHref = year
        ? `${href}${href.includes('?') ? '&' : '?'}year=${year}`
        : href;

    return (
        <Link href={newHref} className={className}>
            {children}
        </Link>
    );
}
