<h1 align="center">📍 India Pincode Map & GeoJSON API</h1>

<p align="center">
  <strong>A high-performance Next.js web app and REST API that visualizes official GeoJSON boundary polygons for 19,312+ Indian Pincodes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Leaflet-Map-green?style=for-the-badge&logo=leaflet" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Pincodes-19%2C312-orange?style=for-the-badge" />
</p>

---

## ✨ Features

- 🗺️ **Interactive Map** — Instantly visualize any Indian pincode boundary on a full-screen map
- ⚡ **Fast REST API** — Returns GeoJSON `Feature` objects for any pincode in milliseconds
- 🧠 **In-Memory Cache** — 90MB dataset loaded once and cached globally for blazing-fast lookups
- 📄 **API Documentation Page** — Built-in interactive docs with a live API tester at `/documentation`
- 🔌 **Remote-Friendly** — Use the API in any other Next.js, React, or backend project

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the interactive map locally.
Open [http://localhost:3000/documentation](http://localhost:3000/documentation) for the local API docs.

> **Using the deployed version?** → [https://fetchpin.vercel.app](https://fetchpin.vercel.app)

---

## 📡 API Endpoint

### `GET /api/pincode/[code]`

Returns the complete GeoJSON `Feature` for a given 6-digit Indian pincode.

### 🌐 Base URL

| Environment | Base URL |
|-------------|----------|
| **Local** (self-hosted) | `http://localhost:3000` |
| **Deployed** (Vercel) | `https://fetchpin.vercel.app` |

> If you are running this project locally with `npm run dev`, use `http://localhost:3000/api/pincode/[code]`.  
> If you just want to use the API without setting anything up, use the deployed URL directly.

**Example (deployed):**
```bash
curl https://fetchpin.vercel.app/api/pincode/700091
```

**Example (local):**
```bash
curl http://localhost:3000/api/pincode/700091
```

**Success Response (200):**
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
    "coordinates": [[[88.4117, 22.5848], ...]]
  }
}
```

**Error Responses:**
| Status | Meaning |
|--------|---------|
| 404 | Pincode not found in dataset |
| 400 | Invalid pincode format |
| 500 | Server failed to parse data |

---

## 💻 Usage in Another Project

```tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

export default function PincodeMap({ pincode }: { pincode: string }) {
  const [boundary, setBoundary] = useState(null);

  useEffect(() => {
    fetch(`https://fetchpin.vercel.app/api/pincode/${pincode}`)
      .then(r => r.json())
      .then(setBoundary);
  }, [pincode]);

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: 400 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {boundary && <GeoJSON data={boundary} />}
    </MapContainer>
  );
}
```

---

## 👨‍💻 Developers

| Name | Role |
|------|------|
| **Amitava Datta** | Developer |
| **Pranay De** | Developer |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

© 2026 Amitava Datta & Pranay De
