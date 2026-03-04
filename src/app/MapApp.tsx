'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component to handle map fitting to bounds
function FitBounds({ boundaryRef }: { boundaryRef: React.MutableRefObject<any> }) {
    const map = useMap();

    useEffect(() => {
        if (boundaryRef.current) {
            const bounds = boundaryRef.current.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds);
                // Open popup for the first feature
                const layers = boundaryRef.current.getLayers();
                if (layers.length > 0) {
                    layers[0].openPopup();
                }
            }
        }
    }); // Run when rendered (after key changed)

    return null;
}

export default function MapApp() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [matchedFeature, setMatchedFeature] = useState<any | null>(null);

    const geoJsonRef = useRef<any>(null);

    const handleSearch = async () => {
        setErrorMsg('');
        const term = searchVal.trim();

        if (!term) {
            setErrorMsg('Please enter a pincode');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/pincode/${term}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setErrorMsg('Pincode not found!');
                } else {
                    setErrorMsg('Failed to search pincode. Server error.');
                }
                setMatchedFeature(null);
                return;
            }

            const featureData = await response.json();
            setMatchedFeature(featureData);
        } catch (error: any) {
            console.error("Search error:", error);
            setErrorMsg('Network error while searching.');
            setMatchedFeature(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const geoJsonStyle = {
        color: "#228be6",
        weight: 3,
        fillColor: "#74c0fc",
        fillOpacity: 0.5
    };

    const onEachFeature = (feature: any, layer: any) => {
        const props = feature.properties;
        layer.bindPopup(
            `<div style="font-family: Arial;">
        <h3 style="margin: 0 0 8px 0; color: #1c7ed6;">Pincode: ${props.Pincode || "N/A"}</h3>
        <b>Office:</b> ${props.Office_Name || "N/A"}<br>
        <b>Division:</b> ${props.Division || "N/A"}<br>
        <b>Region:</b> ${props.Region || "N/A"}<br>
        <b>Circle:</b> ${props.Circle || "N/A"}
      </div>`
        );
    };

    return (
        <div className="relative w-full h-screen font-sans bg-gray-50">
            {/* Search Bar UI */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[1000] bg-white p-4 rounded-xl shadow-lg flex gap-3 w-[90%] max-w-md items-center transition-all duration-300">
                <input
                    type="text"
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg outline-none transition-colors duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 placeholder-gray-400 text-gray-800"
                    placeholder="Enter Pincode (e.g. 700091)"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <button
                    className="px-6 py-3 text-base font-semibold bg-blue-500 text-white border-none rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-600 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Search
                </button>
                {errorMsg && (
                    <div className="absolute top-full mt-2 left-0 w-full text-center text-red-500 text-sm font-medium">
                        {errorMsg}
                    </div>
                )}
            </div>

            {loading && (
                <div className="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-6 py-3 rounded-lg font-bold text-gray-700 shadow-md border border-gray-200 flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching Pincode...
                </div>
            )}

            {/* Map */}
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {matchedFeature && (
                    <GeoJSON
                        key={matchedFeature.properties.Pincode} // Force remount on new feature
                        data={matchedFeature}
                        style={geoJsonStyle}
                        onEachFeature={onEachFeature}
                        ref={geoJsonRef}
                    >
                        <FitBounds boundaryRef={geoJsonRef} />
                    </GeoJSON>
                )}
            </MapContainer>
        </div>
    );
}
