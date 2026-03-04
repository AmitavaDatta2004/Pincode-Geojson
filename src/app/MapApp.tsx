'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

function FitBounds({ boundaryRef }: { boundaryRef: React.MutableRefObject<any> }) {
    const map = useMap();
    useEffect(() => {
        if (boundaryRef.current) {
            const bounds = boundaryRef.current.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [80, 80] });
                const layers = boundaryRef.current.getLayers();
                if (layers.length > 0) layers[0].openPopup();
            }
        }
    });
    return null;
}

const QUICK_SEARCHES = [
    { label: 'Mumbai', code: '400001' },
    { label: 'Delhi', code: '110001' },
    { label: 'Kolkata', code: '700001' },
    { label: 'Chennai', code: '600001' },
    { label: 'Bengaluru', code: '560001' },
];

export default function MapApp() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [matchedFeature, setMatchedFeature] = useState<any | null>(null);
    const [resultInfo, setResultInfo] = useState<any | null>(null);
    const geoJsonRef = useRef<any>(null);

    const doSearch = async (code: string) => {
        setErrorMsg('');
        if (!code || !/^\d{6}$/.test(code)) { setErrorMsg('Enter a valid 6-digit pincode'); return; }
        setLoading(true);
        setMatchedFeature(null);
        setResultInfo(null);
        try {
            const res = await fetch(`/api/pincode/${code}`);
            if (!res.ok) { setErrorMsg(res.status === 404 ? 'Pincode not found!' : 'Server error. Try again.'); return; }
            const data = await res.json();
            setMatchedFeature(data);
            setResultInfo(data.properties);
        } catch { setErrorMsg('Network error. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleSearch = () => doSearch(searchVal.trim());
    const handleQuick = (code: string) => { setSearchVal(code); doSearch(code); };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };
    const clearSearch = () => { setSearchVal(''); setErrorMsg(''); setMatchedFeature(null); setResultInfo(null); };

    const geoJsonStyle = { color: '#3b82f6', weight: 2.5, fillColor: '#3b82f6', fillOpacity: 0.18 };

    const onEachFeature = (feature: any, layer: any) => {
        const p = feature.properties;
        layer.bindPopup(
            `<div style="font-family:'Segoe UI',sans-serif;min-width:190px">
              <div style="font-size:17px;font-weight:800;color:#1d4ed8;margin-bottom:6px">📍 ${p.Pincode}</div>
              <div style="font-size:13px;color:#374151;line-height:1.8">
                <b>${p.Office_Name || '—'}</b><br>
                <span style="color:#6b7280">${p.Division || ''} · ${p.Circle || ''}</span>
              </div>
            </div>`
        );
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-50">

            {/* ── Map ── */}
            <MapContainer center={[22.5937, 82.9629]} zoom={5} className="w-full h-full" zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {matchedFeature && (
                    <GeoJSON key={matchedFeature.properties.Pincode} data={matchedFeature} style={geoJsonStyle} onEachFeature={onEachFeature} ref={geoJsonRef}>
                        <FitBounds boundaryRef={geoJsonRef} />
                    </GeoJSON>
                )}
            </MapContainer>

            {/* ── Left Sidebar Panel ── */}
            <div className="absolute top-0 left-0 h-full w-80 z-[1000] flex flex-col bg-white/90 backdrop-blur-xl border-r border-gray-200/80 shadow-2xl">

                {/* Branding */}
                <div className="px-6 pt-7 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/30 shrink-0">
                            📍
                        </div>
                        <div>
                            <h1 className="text-gray-900 font-extrabold text-lg leading-tight">India Pincode</h1>
                            <p className="text-gray-400 text-xs font-medium">Boundary Explorer</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                            Live
                        </span>
                        <span>19,312 boundaries indexed</span>
                    </div>
                </div>

                {/* Search */}
                <div className="px-5 pt-5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Search Pincode</label>
                    <div className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 ${errorMsg ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white'}`}>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="e.g. 700091"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent flex-1 text-gray-800 font-mono text-sm outline-none placeholder-gray-400"
                        />
                        {searchVal && (
                            <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {errorMsg && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {errorMsg}
                        </p>
                    )}

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full mt-3 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Searching…
                            </>
                        ) : 'Search Boundary'}
                    </button>
                </div>

                {/* Quick Search */}
                <div className="px-5 pt-5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quick Search</label>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_SEARCHES.map(q => (
                            <button
                                key={q.code}
                                onClick={() => handleQuick(q.code)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result Card */}
                {resultInfo && !loading && (
                    <div className="mx-5 mt-5 rounded-xl bg-blue-50 border border-blue-200/60 p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                                <div className="text-blue-700 font-extrabold text-xl">{resultInfo.Pincode}</div>
                                <div className="text-blue-500 font-semibold text-xs">{resultInfo.Circle}</div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base shrink-0">📍</div>
                        </div>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex gap-2">
                                <span className="text-gray-400 text-xs w-16 shrink-0 pt-0.5">Office</span>
                                <span className="text-gray-800 font-medium text-xs">{resultInfo.Office_Name || '—'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-400 text-xs w-16 shrink-0 pt-0.5">Division</span>
                                <span className="text-gray-800 font-medium text-xs">{resultInfo.Division || '—'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-400 text-xs w-16 shrink-0 pt-0.5">Region</span>
                                <span className="text-gray-800 font-medium text-xs">{resultInfo.Region || '—'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* API Docs CTA */}
                <div className="px-5 pb-3">
                    <Link
                        href="/documentation"
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 group"
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <div className="flex-1">
                            <div>🚀 API Documentation</div>
                            <div className="text-blue-200 font-normal text-xs">Use in your own projects →</div>
                        </div>
                    </Link>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-1 border-t border-gray-100 mt-1">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Developed by{' '}
                        <span className="text-gray-700 font-semibold">Amitava Datta</span>{' & '}
                        <span className="text-gray-700 font-semibold">Pranay De</span>
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">MIT License © {new Date().getFullYear()}</p>
                </div>

            </div>

        </div>
    );
}
