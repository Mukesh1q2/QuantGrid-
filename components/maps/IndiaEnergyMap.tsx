'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { clsx } from 'clsx'

// Import Leaflet CSS in the component
import 'leaflet/dist/leaflet.css'

// India-focused energy asset data with real coordinates
const ENERGY_ASSETS = [
    {
        id: 1,
        name: 'Bhadla Solar Park',
        type: 'solar',
        lat: 27.5294,
        lng: 71.9100,
        capacity: 2245,
        status: 'online',
        region: 'Rajasthan',
        description: 'World\'s largest solar park'
    },
    {
        id: 2,
        name: 'Kutch Wind Farm',
        type: 'wind',
        lat: 23.7337,
        lng: 69.8597,
        capacity: 1500,
        status: 'online',
        region: 'Gujarat',
        description: 'Major wind energy hub'
    },
    {
        id: 3,
        name: 'Tehri Hydro Power',
        type: 'hydro',
        lat: 30.3782,
        lng: 78.4803,
        capacity: 1000,
        status: 'online',
        region: 'Uttarakhand',
        description: 'Largest hydro plant in India'
    },
    {
        id: 4,
        name: 'Mundra Thermal',
        type: 'thermal',
        lat: 22.8395,
        lng: 69.7197,
        capacity: 4620,
        status: 'online',
        region: 'Gujarat',
        description: 'Ultra mega power project'
    },
    {
        id: 5,
        name: 'Kamuthi Solar Park',
        type: 'solar',
        lat: 9.3700,
        lng: 78.3800,
        capacity: 648,
        status: 'online',
        region: 'Tamil Nadu',
        description: 'Southeast Asia\'s largest solar park'
    },
    {
        id: 6,
        name: 'Muppandal Wind Farm',
        type: 'wind',
        lat: 8.1703,
        lng: 77.5130,
        capacity: 1500,
        status: 'partial',
        region: 'Tamil Nadu',
        description: 'One of largest wind farms'
    },
    {
        id: 7,
        name: 'Kudankulam Nuclear',
        type: 'nuclear',
        lat: 8.1678,
        lng: 77.7127,
        capacity: 2000,
        status: 'online',
        region: 'Tamil Nadu',
        description: 'Largest nuclear power station'
    },
    {
        id: 8,
        name: 'Vindhyachal Thermal',
        type: 'thermal',
        lat: 24.0852,
        lng: 82.6471,
        capacity: 4760,
        status: 'online',
        region: 'Madhya Pradesh',
        description: 'Largest thermal power station'
    },
    {
        id: 9,
        name: 'Rewa Solar Park',
        type: 'solar',
        lat: 24.5355,
        lng: 81.3035,
        capacity: 750,
        status: 'maintenance',
        region: 'Madhya Pradesh',
        description: 'Asia\'s largest solar power plant'
    },
    {
        id: 10,
        name: 'Jaisalmer Wind Park',
        type: 'wind',
        lat: 26.9157,
        lng: 70.9083,
        capacity: 1064,
        status: 'online',
        region: 'Rajasthan',
        description: 'Major wind energy complex'
    }
]

// Power transmission interconnection lines between major assets
const POWER_LINES = [
    { from: 1, to: 4, voltage: '765kV', type: 'hvdc' },   // Bhadla to Mundra
    { from: 4, to: 2, voltage: '400kV', type: 'ac' },     // Mundra to Kutch
    { from: 8, to: 9, voltage: '400kV', type: 'ac' },     // Vindhyachal to Rewa
    { from: 3, to: 8, voltage: '765kV', type: 'hvdc' },   // Tehri to Vindhyachal
    { from: 5, to: 6, voltage: '400kV', type: 'ac' },     // Kamuthi to Muppandal
    { from: 6, to: 7, voltage: '400kV', type: 'ac' },     // Muppandal to Kudankulam
    { from: 1, to: 10, voltage: '400kV', type: 'ac' },    // Bhadla to Jaisalmer
    { from: 9, to: 5, voltage: '765kV', type: 'hvdc' },   // Rewa to Kamuthi (North-South)
]

// Asset type styling
const ASSET_STYLES = {
    solar: { color: '#f59e0b', icon: '☀️', label: 'Solar' },
    wind: { color: '#3b82f6', icon: '💨', label: 'Wind' },
    hydro: { color: '#06b6d4', icon: '💧', label: 'Hydro' },
    thermal: { color: '#ef4444', icon: '🔥', label: 'Thermal' },
    nuclear: { color: '#8b5cf6', icon: '⚛️', label: 'Nuclear' }
}

const STATUS_STYLES = {
    online: { color: 'bg-green-500', text: 'Online' },
    offline: { color: 'bg-red-500', text: 'Offline' },
    partial: { color: 'bg-orange-500', text: 'Partial' },
    maintenance: { color: 'bg-yellow-500', text: 'Maintenance' }
}

interface IndiaEnergyMapProps {
    className?: string
    showPowerLines?: boolean
    onAssetClick?: (asset: typeof ENERGY_ASSETS[0]) => void
}

// This component will be dynamically imported to avoid SSR issues with Leaflet
const MapComponent = ({ className, showPowerLines = true, onAssetClick }: IndiaEnergyMapProps) => {
    const [L, setL] = useState<any>(null)
    const [map, setMap] = useState<any>(null)
    const [selectedAsset, setSelectedAsset] = useState<typeof ENERGY_ASSETS[0] | null>(null)
    const [filterType, setFilterType] = useState<string>('all')

    useEffect(() => {
        // Dynamic import of Leaflet for client-side only
        import('leaflet').then((leaflet) => {
            setL(leaflet.default)
        })
    }, [])

    useEffect(() => {
        if (!L || map) return

        // Fix Leaflet default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Initialize map centered on India
        const mapInstance = L.map('india-energy-map', {
            center: [22.5937, 78.9629], // India center
            zoom: 5,
            minZoom: 4,
            maxZoom: 10,
            scrollWheelZoom: true,
            zoomControl: true
        })

        // Add dark/light themed tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mapInstance)

        setMap(mapInstance)

        return () => {
            mapInstance.remove()
        }
    }, [L])

    useEffect(() => {
        if (!L || !map) return

        // Clear existing layers
        map.eachLayer((layer: any) => {
            if (layer._url === undefined || !layer._url.includes('basemaps')) {
                // Keep tile layer, remove others
                if (layer.options?.className?.includes('asset-marker') ||
                    layer.options?.className === 'power-line') {
                    map.removeLayer(layer)
                }
            }
        })

        // Filter assets
        const filteredAssets = filterType === 'all'
            ? ENERGY_ASSETS
            : ENERGY_ASSETS.filter(a => a.type === filterType)

        // Add power transmission lines
        if (showPowerLines) {
            POWER_LINES.forEach(line => {
                const fromAsset = ENERGY_ASSETS.find(a => a.id === line.from)
                const toAsset = ENERGY_ASSETS.find(a => a.id === line.to)

                if (fromAsset && toAsset) {
                    const polyline = L.polyline(
                        [[fromAsset.lat, fromAsset.lng], [toAsset.lat, toAsset.lng]],
                        {
                            color: line.type === 'hvdc' ? '#f59e0b' : '#60a5fa',
                            weight: line.type === 'hvdc' ? 3 : 2,
                            opacity: 0.7,
                            dashArray: line.type === 'hvdc' ? '' : '10, 10',
                            className: 'power-line'
                        }
                    ).addTo(map)

                    polyline.bindTooltip(`${line.voltage} ${line.type.toUpperCase()}`, {
                        permanent: false,
                        direction: 'center'
                    })
                }
            })
        }

        // Add asset markers
        filteredAssets.forEach(asset => {
            const style = ASSET_STYLES[asset.type as keyof typeof ASSET_STYLES]
            const statusStyle = STATUS_STYLES[asset.status as keyof typeof STATUS_STYLES]

            // Create custom icon
            const icon = L.divIcon({
                className: 'asset-marker',
                html: `
                    <div style="
                        background: ${style.color};
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        position: relative;
                    ">
                        <span>${style.icon}</span>
                        <div style="
                            position: absolute;
                            bottom: -4px;
                            right: -4px;
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            background: ${asset.status === 'online' ? '#22c55e' :
                        asset.status === 'maintenance' ? '#eab308' :
                            asset.status === 'partial' ? '#f97316' : '#ef4444'};
                            border: 2px solid white;
                        "></div>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })

            const marker = L.marker([asset.lat, asset.lng], { icon })
                .addTo(map)
                .on('click', () => {
                    setSelectedAsset(asset)
                    onAssetClick?.(asset)
                })

            // Tooltip on hover
            marker.bindTooltip(`
                <strong>${asset.name}</strong><br/>
                ${asset.capacity} MW | ${asset.region}
            `, {
                direction: 'top',
                offset: [0, -16]
            })
        })
    }, [L, map, filterType, showPowerLines, onAssetClick])

    if (!L) {
        return (
            <div className={clsx("relative bg-gray-100 dark:bg-gray-800 rounded-xl", className)}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading India Energy Map...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={clsx("relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden", className)}>
            {/* Filter Controls */}
            <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => setFilterType('all')}
                        className={clsx(
                            'px-2 py-1 text-xs rounded-md transition-colors',
                            filterType === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        )}
                    >
                        All
                    </button>
                    {Object.entries(ASSET_STYLES).map(([type, style]) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={clsx(
                                'px-2 py-1 text-xs rounded-md transition-colors',
                                filterType === type
                                    ? 'text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            )}
                            style={{ backgroundColor: filterType === type ? style.color : undefined }}
                        >
                            {style.icon} {style.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div id="india-energy-map" className="w-full h-full" style={{ minHeight: '400px' }} />

            {/* Selected Asset Info Panel */}
            {selectedAsset && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xl"
                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                            >
                                {ASSET_STYLES[selectedAsset.type as keyof typeof ASSET_STYLES]?.icon}
                            </span>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                {selectedAsset.name}
                            </h3>
                        </div>
                        <button
                            onClick={() => setSelectedAsset(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {selectedAsset.capacity} MW
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Region:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {selectedAsset.region}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                            <span className={clsx(
                                'px-2 py-0.5 rounded-full text-white text-xs',
                                STATUS_STYLES[selectedAsset.status as keyof typeof STATUS_STYLES]?.color
                            )}>
                                {STATUS_STYLES[selectedAsset.status as keyof typeof STATUS_STYLES]?.text}
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                        {selectedAsset.description}
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Power Grid</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-amber-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">HVDC Line</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-blue-400 border-dashed"></div>
                        <span className="text-gray-600 dark:text-gray-400">AC Line</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export with dynamic import to prevent SSR issues
export const IndiaEnergyMap = dynamic(() => Promise.resolve(MapComponent), {
    ssr: false,
    loading: () => (
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl h-full min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading India Energy Map...</p>
            </div>
        </div>
    )
})

export default IndiaEnergyMap
