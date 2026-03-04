'use client';

import dynamic from 'next/dynamic';

const MapApp = dynamic(() => import('./MapApp'), {
    ssr: false, // Map loading issues via SSR with Leaflet
});

export default function Home() {
    return (
        <main suppressHydrationWarning>
            <MapApp />
        </main>
    );
}
