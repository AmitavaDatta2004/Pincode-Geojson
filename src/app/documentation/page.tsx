'use client';

import { useState } from 'react';
import Link from 'next/link';

const CODE_CURL_LOCAL = `curl http://localhost:3000/api/pincode/700091`;
const CODE_CURL_DEPLOYED = `curl https://fetchpin.vercel.app/api/pincode/700091`;

const CODE_FETCH_LOCAL = `const response = await fetch('http://localhost:3000/api/pincode/700091');
const data = await response.json();
console.log(data);`;

const CODE_FETCH_DEPLOYED = `const response = await fetch('https://fetchpin.vercel.app/api/pincode/700091');
const data = await response.json();
console.log(data);`;

const CODE_REACT = `import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper: auto-fits map to the returned polygon's bounds
function FitBounds({ data }: { data: any }) {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds());
  }, [data, map]);
  return null;
}

export default function PincodeMap({ pincode }: { pincode: string }) {
  const [boundary, setBoundary] = useState(null);

  useEffect(() => {
    if (!pincode) return;
    fetch(\`/api/pincode/\${pincode}\`)
      .then(r => r.json())
      .then(data => setBoundary(data));
  }, [pincode]);

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: 400 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {boundary && (
        <>
          <GeoJSON data={boundary} />
          <FitBounds data={boundary} />
        </>
      )}
    </MapContainer>
  );
}`;

const CODE_RESPONSE_OK = `{
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
            "coordinates": [[[88.4117, 22.5848], [88.4187, 22.5833], ...]]
    }
}`;

const CODE_RESPONSE_404 = `{
    "error": "Boundary data not found for pincode: 123456"
}`;

type Tab = 'curl' | 'fetch' | 'react';

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative rounded-xl bg-gray-900 border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">{language}</span>
                <button
                    onClick={copy}
                    className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
                >
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function Badge({ text, color }: { text: string; color: string }) {
    return (
        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded font-mono ${color}`}>
            {text}
        </span>
    );
}

export default function DocsPage() {
    const [livePin, setLivePin] = useState('');
    const [liveResult, setLiveResult] = useState<string | null>(null);
    const [liveError, setLiveError] = useState('');
    const [liveLoading, setLiveLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('curl');
    const [useLocal, setUseLocal] = useState(false);

    const CODE_CURL = useLocal ? CODE_CURL_LOCAL : CODE_CURL_DEPLOYED;
    const CODE_FETCH = useLocal ? CODE_FETCH_LOCAL : CODE_FETCH_DEPLOYED;

    const testApi = async () => {
        setLiveError('');
        setLiveResult(null);
        const pin = livePin.trim();
        if (!pin) { setLiveError('Please enter a pincode'); return; }
        setLiveLoading(true);
        try {
            const res = await fetch(`/api/pincode/${pin}`);
            const data = await res.json();
            setLiveResult(JSON.stringify(data, null, 2));
            if (!res.ok) setLiveError(`Status ${res.status}`);
        } catch (e) {
            setLiveError('Network error');
        } finally {
            setLiveLoading(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'curl', label: 'cURL' },
        { key: 'fetch', label: 'JS Fetch' },
        { key: 'react', label: 'React Component' },
    ];

    const tabCode: Record<Tab, { code: string; lang: string }> = {
        curl: { code: CODE_CURL, lang: 'bash' },
        fetch: { code: CODE_FETCH, lang: 'javascript' },
        react: { code: CODE_REACT, lang: 'tsx' },
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans">
            {/* Header */}
            <header className="border-b border-gray-800 sticky top-0 bg-[#0d1117]/90 backdrop-blur z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg">📍</div>
                        <span className="font-bold text-lg text-white">Pincode API</span>
                        <Badge text="v1.0" color="bg-blue-900 text-blue-300" />
                    </div>
                    <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        ← Back to Map
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* Hero */}
                <section className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Indian Pincode GeoJSON API
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A high-performance REST API that returns official GeoJSON boundary polygons for any Indian pincode. Instantly integrate postal boundaries into your maps and applications.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Badge text="19,000+ Pincodes" color="bg-green-900 text-green-300" />
                        <Badge text="GeoJSON Compliant" color="bg-purple-900 text-purple-300" />
                        <Badge text="In-Memory Cached" color="bg-yellow-900 text-yellow-300" />
                        <Badge text="Free to Use" color="bg-blue-900 text-blue-300" />
                    </div>
                </section>

                {/* Endpoint Reference */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Endpoint</h2>
                        <p className="text-gray-400 text-sm">Single endpoint. No authentication required.</p>
                    </div>

                    {/* Base URL Notice */}
                    <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-blue-300 font-bold text-sm mb-1">🌐 Choose your Base URL</p>
                                <p className="text-gray-400 text-xs">Use the deployed URL directly — or clone the repo and run locally.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className={!useLocal ? 'text-blue-400 font-bold' : 'text-gray-500'}>Deployed</span>
                                <button
                                    onClick={() => setUseLocal(l => !l)}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 overflow-hidden ${useLocal ? 'bg-green-600' : 'bg-blue-600'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${useLocal ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                </button>
                                <span className={useLocal ? 'text-green-400 font-bold' : 'text-gray-500'}>Local</span>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className={`rounded-lg border p-3 transition-all ${!useLocal ? 'border-blue-500/60 bg-blue-900/30' : 'border-gray-700 opacity-50'}`}>
                                <p className="text-xs text-gray-400 mb-1 font-semibold">☁️ Deployed (Vercel)</p>
                                <code className="text-blue-300 font-mono text-xs break-all">https://fetchpin.vercel.app</code>
                                <p className="text-gray-500 text-xs mt-1">No setup needed. Use directly.</p>
                            </div>
                            <div className={`rounded-lg border p-3 transition-all ${useLocal ? 'border-green-500/60 bg-green-900/20' : 'border-gray-700 opacity-50'}`}>
                                <p className="text-xs text-gray-400 mb-1 font-semibold">💻 Local (Self-hosted)</p>
                                <code className="text-green-300 font-mono text-xs">http://localhost:3000</code>
                                <p className="text-gray-500 text-xs mt-1">Run: <code className="text-gray-300">npm install && npm run dev</code></p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-4 px-5 py-4 bg-gray-800/60">
                            <Badge text="GET" color="bg-green-900 text-green-300" />
                            <code className="text-blue-300 font-mono text-sm">/api/pincode/<span className="text-yellow-300">{'{code}'}</span></code>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <p className="text-gray-300">Fetches the complete GeoJSON <code className="bg-gray-800 px-1 rounded text-yellow-300">Feature</code> object for a specific 6-digit Indian pincode.</p>
                            <div>
                                <p className="text-gray-400 font-semibold mb-2">URL Parameters</p>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-700">
                                            <th className="pb-2 pr-6 font-medium">Param</th>
                                            <th className="pb-2 pr-6 font-medium">Type</th>
                                            <th className="pb-2 font-medium">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-gray-300">
                                            <td className="py-2 pr-6 font-mono text-yellow-300">code</td>
                                            <td className="py-2 pr-6 text-gray-400">string</td>
                                            <td className="py-2">A valid 6-digit Indian Pincode (e.g. <code className="text-blue-300">700091</code>)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Code Examples */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Examples</h2>
                        <p className="text-gray-400 text-sm">How to call the API from different environments.</p>
                    </div>

                    <div className="flex gap-2 border-b border-gray-700">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === t.key
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <CodeBlock code={tabCode[activeTab].code} language={tabCode[activeTab].lang} />
                </section>

                {/* Response Formats */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Responses</h2>
                        <p className="text-gray-400 text-sm">The API always returns JSON.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge text="200 OK" color="bg-green-900 text-green-300" />
                                <span className="text-sm text-gray-300">Success — returns GeoJSON Feature</span>
                            </div>
                            <CodeBlock code={CODE_RESPONSE_OK} language="json" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge text="404 Not Found" color="bg-red-900 text-red-300" />
                                <span className="text-sm text-gray-300">Pincode doesn't exist</span>
                            </div>
                            <CodeBlock code={CODE_RESPONSE_404} language="json" />
                            <div className="flex items-start gap-2 mt-2">
                                <Badge text="500" color="bg-orange-900 text-orange-300" />
                                <span className="text-sm text-gray-400">Server error parsing boundary data</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge text="400" color="bg-yellow-900 text-yellow-300" />
                                <span className="text-sm text-gray-400">Invalid pincode format provided</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Live Tester */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Live API Tester</h2>
                        <p className="text-gray-400 text-sm">Try the endpoint right now — the response is real.</p>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6 space-y-4">
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 flex-1 font-mono text-sm">
                                <span className="text-gray-500 select-none">/api/pincode/</span>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="700091"
                                    value={livePin}
                                    onChange={e => setLivePin(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={e => e.key === 'Enter' && testApi()}
                                    className="bg-transparent outline-none text-white py-3 flex-1 placeholder-gray-600 min-w-0"
                                />
                            </div>
                            <button
                                onClick={testApi}
                                disabled={liveLoading}
                                className="px-6 py-3 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {liveLoading ? 'Fetching...' : 'Send Request →'}
                            </button>
                        </div>
                        {liveError && <p className="text-red-400 text-sm">{liveError}</p>}
                        {liveResult && (
                            <div>
                                <p className="text-xs text-green-400 mb-2 font-mono">Response received ✓</p>
                                <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-xs text-gray-200 font-mono overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                                    {liveResult}
                                </pre>
                            </div>
                        )}
                    </div>
                </section>

                {/* Performance */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Performance</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Response Time', value: '< 5ms', sub: 'after first warm-up request', icon: '⚡' },
                            { label: 'Dataset Size', value: '19,312', sub: 'pincode boundaries indexed', icon: '📦' },
                            { label: 'Cache Strategy', value: 'In-Memory', sub: 'no repeated file I/O on server', icon: '🧠' },
                        ].map(c => (
                            <div key={c.label} className="rounded-xl bg-gray-800/60 border border-gray-700 p-5 space-y-1">
                                <div className="text-2xl">{c.icon}</div>
                                <div className="text-xl font-bold text-white">{c.value}</div>
                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{c.label}</div>
                                <div className="text-xs text-gray-500">{c.sub}</div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <footer className="border-t border-gray-800 text-center py-8 text-sm text-gray-600">
                India Pincode API — Built with Next.js
            </footer>
        </div>
    );
}
