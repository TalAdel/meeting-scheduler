import { useEffect, useState, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useUserCountry } from '../hooks/useUserCountry'
import { MapPin } from 'lucide-react'


interface MeetingMapProps {
  location: string
  locationCountry?: string | null | undefined
  latitude?: number | null | undefined
  longitude?: number | null | undefined
  onError?: (error: string) => void
}

interface MapPosition {
  lat: number
  lng: number
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
}

export function MeetingMap({ 
  location, 
  locationCountry,
  latitude,
  longitude,
  onError 
}: MeetingMapProps) {
  const { country: detectedCountry, loading: countryLoading } = useUserCountry()
  const [mapCenter, setMapCenter] = useState<MapPosition | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formattedAddress, setFormattedAddress] = useState<string>('')

  console.log('MeetingMap props:', { location, locationCountry, latitude, longitude })

  const geocodeAddress = useCallback((address: string) => {
    if (!window.google?.maps) {
      console.log('Google Maps not loaded yet, waiting...')
      return
    }

    setIsGeocoding(true)
    setError(null)

    const geocoder = new window.google.maps.Geocoder()
    const regionCode = locationCountry || detectedCountry || undefined
    const userLanguage = navigator.language.split('-')[0]

    console.log('🌍 Geocoding:', address, '| Region:', regionCode, '| Language:', userLanguage)

    geocoder.geocode(
      {
        address: address,
        region: regionCode,
        language: userLanguage,
      },
      (results, status) => {
        setIsGeocoding(false)

        if (status === 'OK' && results && results[0]) {
          const position = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          }
          setMapCenter(position)
          setFormattedAddress(results[0].formatted_address)
          console.log('📍 Location found:', results[0].formatted_address)
        } else if (status === 'ZERO_RESULTS') {
          const errorMsg = 'Location not found. Try adding more details (city, country)'
          setError(errorMsg)
          onError?.(errorMsg)
        } else {
          const errorMsg = `Geocoding failed: ${status}`
          setError(errorMsg)
          onError?.(errorMsg)
          console.error('Geocoding error:', status)
        }
      }
    )
  }, [locationCountry, detectedCountry, onError])

  // Use cached coordinates or geocode
  useEffect(() => {
    if (!location) return

    // Use cached coordinates if available
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude })
      setFormattedAddress(location)
      setIsGeocoding(false)
      return
    }

    // Geocode when country is detected and Google Maps is available
    if (!countryLoading && window.google?.maps) {
      geocodeAddress(location)
    }
  }, [location, latitude, longitude, countryLoading, geocodeAddress])

  if (!location) {
    return null
  }

  // Show loading
  if (countryLoading || isGeocoding || !window.google?.maps) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">
            {!window.google?.maps ? 'Loading Google Maps...' : isGeocoding ? 'Finding location...' : 'Detecting region...'}
          </p>
        </div>
      </div>
    )
  }

  // Show geocoding error
  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // Wait for geocoding to complete
  if (!mapCenter) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Locating address...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {formattedAddress && formattedAddress !== location && (
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {formattedAddress}
        </p>
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={15}
        options={{
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        <Marker 
          position={mapCenter} 
          title={location}
        />
      </GoogleMap>
    </div>
  )
}

export default MeetingMap
