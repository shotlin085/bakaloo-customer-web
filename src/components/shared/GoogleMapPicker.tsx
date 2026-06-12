'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { Check, MapPin, X } from 'lucide-react'

interface GoogleMapPickerProps {
    initialLat?: number
    initialLng?: number
    onSelect: (lat: number, lng: number, address?: string) => void
    onClose: () => void
}

const containerStyle = { width: '100%', height: '300px', borderRadius: '16px' }
const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 }

export function GoogleMapPicker({ initialLat, initialLng, onSelect, onClose }: GoogleMapPickerProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    })

    const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
    )

    const center = selected || (initialLat && initialLng ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER)

    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        setSelected({ lat: event.latLng.lat(), lng: event.latLng.lng() })
    }, [])

    const handleConfirm = async () => {
        if (!selected) return

        let address: string | undefined
        try {
            const geocoder = new google.maps.Geocoder()
            const result = await geocoder.geocode({ location: selected })
            address = result.results[0]?.formatted_address
        } catch {
            address = undefined
        }

        onSelect(selected.lat, selected.lng, address)
    }

    if (!isLoaded) {
        return <div className="skeleton-shimmer h-[300px] rounded-2xl" />
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-gray-900">Pick Location</span>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                    type="button"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onClick={handleMapClick}
                options={{ disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' }}
            >
                {selected && <Marker position={selected} />}
            </GoogleMap>

            <p className="text-center text-xs text-gray-500">Tap on the map to set your location</p>

            <button
                onClick={handleConfirm}
                disabled={!selected}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                type="button"
            >
                <Check className="h-4 w-4" />
                Confirm Location
            </button>
        </div>
    )
}
