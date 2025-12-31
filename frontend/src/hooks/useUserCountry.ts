import { useState, useEffect } from 'react'

interface UserCountryResult {
  country: string | null
  loading: boolean
  error: Error | null
}

export const useUserCountry = (): UserCountryResult => {
  const [country, setCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    detectCountry()
  }, [])

  const detectCountry = async () => {
    try {
      // Primary method: IP-based geolocation (free service)
      const response = await fetch('https://ipapi.co/json/')
      
      if (!response.ok) {
        throw new Error('Primary geolocation service failed')
      }
      
      const data = await response.json()
      
      if (data.country_code) {
        console.log('User country detected:', data.country_code, data.country_name)
        setCountry(data.country_code) // e.g., "IL", "US", "FR"
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Primary geolocation failed, using fallback...')
      
      // Fallback method: Use browser timezone
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const countryFromTimezone = guessCountryFromTimezone(timezone)
        
        if (countryFromTimezone) {
          console.log('Country guessed from timezone:', countryFromTimezone)
          setCountry(countryFromTimezone)
          setLoading(false)
          return
        }
      } catch (err2) {
        console.error('All country detection methods failed:', err2)
        setError(err2 as Error)
      }
    } finally {
      setLoading(false)
    }
  }

  return { country, loading, error }
}

/**
 * Fallback: Guess country from timezone
 * Not 100% accurate but better than nothing
 */
function guessCountryFromTimezone(timezone: string): string | null {
  const timezoneCountryMap: Record<string, string> = {
    // Israel
    'Asia/Jerusalem': 'IL',
    // USA
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    // Europe
    'Europe/London': 'GB',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Madrid': 'ES',
    'Europe/Rome': 'IT',
    // Asia
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Seoul': 'KR',
    'Asia/Singapore': 'SG',
    // Australia
    'Australia/Sydney': 'AU',
    // Add more as needed
  }

  return timezoneCountryMap[timezone] || null
}

export default useUserCountry

