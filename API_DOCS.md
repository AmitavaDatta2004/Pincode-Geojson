# Indian Pincode GeoJSON API

This project exposes a high-performance Next.js API route that retrieves official GeoJSON boundary polygons for any given Indian Pincode.

You can use this API endpoint in any of your independent Next.js or React projects to instantly draw postal boundaries on maps (like Leaflet, Mapbox, or Google Maps) without forcing your clients to download large geospatial datasets.

---

## Endpoint Details

### `GET /api/pincode/[code]`

Fetches the complete GeoJSON `Feature` object for a specific 6-digit Indian pincode.

**URL Parameters:**
- `[code]` (string, required): The 6-digit Indian Pincode you are querying.

**Example Request:**
```bash
curl http://localhost:3000/api/pincode/700091
```

---

## Response Usage Examples

### 1. Success Response (200 OK)
Returns a standard GeoJSON `Feature` object.

```json
{
  "type": "Feature",
  "properties": {
    "Pincode": "700091",
    "Office_Name": "Sech Bhawan SO",
    "Division": "Kolkata East",
    "Region": "Kolkata",
    "Circle": "West Bengal"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [88.411716, 22.584842],
        [88.418699, 22.583301],
        /* ... shortened ... */
        [88.411716, 22.584842]
      ]
    ]
  }
}
```

### 2. Usage in Another Next.js App using React-Leaflet

To render the returned Pincode boundary on a remote application using React-Leaflet:

```tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

export default function RemotePincodeMap({ pincode = '700091' }) {
  const [boundary, setBoundary] = useState(null);

  useEffect(() => {
    async function fetchBoundary() {
      // Point this URL to your deployed or locally running Next.js API
      const res = await fetch(`http://localhost:3000/api/pincode/${pincode}`);
      if (res.ok) {
        const geojsonData = await res.json();
        setBoundary(geojsonData);
      } else {
        console.error("Pincode not found!");
      }
    }
    fetchBoundary();
  }, [pincode]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={[22.584842, 88.411716]} zoom={13} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Pass API Response directly to the Data prop */}
        {boundary && <GeoJSON data={boundary} />}
        
      </MapContainer>
    </div>
  );
}
```

### 3. Error Responses

- **400 Bad Request**: Invalid pincode format provided.
- **404 Not Found**: The requested pincode does not exist in the boundary dataset.
- **500 Internal Server Error**: The server failed to parse the underlying GeoJSON database.

```json
{
  "error": "Boundary data not found for pincode: 123456"
}
```

---

## Performance Considerations

The underlying dataset is approximately ~90MB. The API caches this object in memory upon the first request globally within the Node process (`isLoaded`). Subsequent requests to the API skip file I/O operations and instantly search the cached JSON array in memory, returning responses in just a few milliseconds.
