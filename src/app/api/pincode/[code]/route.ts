import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store loaded data in memory for fast repeated access across requests
let cachedFeatures: any[] | null = null;
let isLoaded = false;

function loadGeoJsonData() {
    if (isLoaded) return;

    try {
        // Read the file directly from the public directory
        const filePath = path.join(process.cwd(), 'public', 'All_India_pincode_Boundary-19312.geojson');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileContent);

        if (parsedData && parsedData.features) {
            cachedFeatures = parsedData.features;
            isLoaded = true;
        }
    } catch (error) {
        console.error("Error loading GeoJSON data in API Route:", error);
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> | { code: string } }
) {
    // Await params to handle both Next.js 14 (sync) and 15+ (async) params safely
    const resolvedParams = await Promise.resolve(params);
    const pincode = resolvedParams.code;

    if (!pincode || typeof pincode !== 'string') {
        return NextResponse.json(
            { error: "Invalid pincode provided" },
            { status: 400 }
        );
    }

    // Load data if it hasn't been loaded into memory yet
    loadGeoJsonData();

    if (!isLoaded || !cachedFeatures) {
        return NextResponse.json(
            { error: "Internal server error: Failed to parse boundary data" },
            { status: 500 }
        );
    }

    // Find the requested pincode boundary
    const match = cachedFeatures.find((f: any) => f.properties.Pincode === pincode);

    if (!match) {
        return NextResponse.json(
            { error: `Boundary data not found for pincode: ${pincode}` },
            { status: 404 }
        );
    }

    // Return the single GeoJSON feature
    return NextResponse.json(match);
}
