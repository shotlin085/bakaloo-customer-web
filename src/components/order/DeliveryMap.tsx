'use client'

import { useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

interface DeliveryMapProps {
    customerLat: number
    customerLng: number
    riderLat?: number | null
    riderLng?: number | null
}

const mapContainerStyle = { width: '100%', height: '280px', borderRadius: '16px' }
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy' as const,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
}

export function DeliveryMap({ customerLat, customerLng, riderLat, riderLng }: DeliveryMapProps) {
    const mapRef = useRef<google.maps.Map | null>(null)

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    })

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map
    }, [])

    useEffect(() => {
        if (!mapRef.current || !riderLat || !riderLng) return
        const bounds = new google.maps.LatLngBounds()
        bounds.extend({ lat: customerLat, lng: customerLng })
        bounds.extend({ lat: riderLat, lng: riderLng })
        mapRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 })
    }, [customerLat, customerLng, riderLat, riderLng])

    if (loadError) {
        return (
            <div className="flex h-[280px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500">Could not load map</p>
            </div>
        )
    }

    if (!isLoaded) {
        return <div className="skeleton-shimmer h-[280px] rounded-2xl" />
    }

    const center =
        riderLat && riderLng
            ? { lat: (customerLat + riderLat) / 2, lng: (customerLng + riderLng) / 2 }
            : { lat: customerLat, lng: customerLng }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            options={mapOptions}
            onLoad={onMapLoad}
        >
            <Marker
                position={{ lat: customerLat, lng: customerLng }}
                icon={{
                    url: '/icons/home-marker.svg',
                    scaledSize: new google.maps.Size(36, 36),
                }}
                title="Your location"
            />

            {riderLat && riderLng && (
                <Marker
                    position={{ lat: riderLat, lng: riderLng }}
                    icon={{
                        url: '/icons/rider-marker.svg',
                        scaledSize: new google.maps.Size(36, 36),
                    }}
                    title="Delivery rider"
                />
            )}
        </GoogleMap>
    )
}
