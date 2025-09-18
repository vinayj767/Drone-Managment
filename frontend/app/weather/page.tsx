'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface WeatherData {
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  visibility: number
  precipitation: number
  pressure: number
  conditions: string
  flightSafety: 'safe' | 'caution' | 'unsafe'
  uvIndex: number
  dewPoint: number
  timestamp: string
}

interface FlightConditions {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous'
  factors: {
    wind: 'safe' | 'caution' | 'unsafe'
    visibility: 'safe' | 'caution' | 'unsafe'
    precipitation: 'safe' | 'caution' | 'unsafe'
    temperature: 'safe' | 'caution' | 'unsafe'
  }
  recommendations: string[]
  restrictions: string[]
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [flightConditions, setFlightConditions] = useState<FlightConditions | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState('headquarters')
  const router = useRouter()

  const locations = [
    { id: 'headquarters', name: 'Headquarters', coords: '40.7128,-74.0060' },
    { id: 'site1', name: 'Survey Site 1', coords: '40.7580,-73.9855' },
    { id: 'site2', name: 'Survey Site 2', coords: '40.6892,-74.0445' },
    { id: 'site3', name: 'Agricultural Zone', coords: '40.7505,-73.9934' },
    { id: 'site4', name: 'Industrial Area', coords: '40.7282,-73.7949' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchWeatherData()
  }, [router, selectedLocation])

  const fetchWeatherData = async () => {
    try {
      // Simulate API call with realistic weather data
      const mockCurrentWeather: WeatherData = {
        location: locations.find(l => l.id === selectedLocation)?.name || 'Unknown',
        temperature: 22 + Math.random() * 10,
        humidity: 45 + Math.random() * 30,
        windSpeed: Math.random() * 25,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        visibility: 8 + Math.random() * 7,
        precipitation: Math.random() * 5,
        pressure: 1010 + Math.random() * 20,
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'][Math.floor(Math.random() * 5)],
        flightSafety: Math.random() > 0.7 ? 'unsafe' : Math.random() > 0.3 ? 'caution' : 'safe',
        uvIndex: Math.floor(Math.random() * 11),
        dewPoint: 15 + Math.random() * 10,
        timestamp: new Date().toISOString()
      }

      setCurrentWeather(mockCurrentWeather)

      // Generate flight conditions assessment
      const conditions = assessFlightConditions(mockCurrentWeather)
      setFlightConditions(conditions)

      // Generate historical data
      const historicalData: WeatherData[] = Array.from({ length: 24 }, (_, i) => ({
        ...mockCurrentWeather,
        temperature: mockCurrentWeather.temperature + (Math.random() - 0.5) * 5,
        windSpeed: Math.max(0, mockCurrentWeather.windSpeed + (Math.random() - 0.5) * 10),
        humidity: Math.max(20, Math.min(95, mockCurrentWeather.humidity + (Math.random() - 0.5) * 20)),
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
      })).reverse()

      setWeatherData(historicalData)
    } catch (error) {
      console.error('Error fetching weather data:', error)
    } finally {
      setLoading(false)
    }
  }

  const assessFlightConditions = (weather: WeatherData): FlightConditions => {
    const factors = {
      wind: weather.windSpeed > 20 ? 'unsafe' : weather.windSpeed > 15 ? 'caution' : 'safe',
      visibility: weather.visibility < 3 ? 'unsafe' : weather.visibility < 5 ? 'caution' : 'safe',
      precipitation: weather.precipitation > 2 ? 'unsafe' : weather.precipitation > 0.5 ? 'caution' : 'safe',
      temperature: weather.temperature < 0 || weather.temperature > 40 ? 'unsafe' : 
                   weather.temperature < 5 || weather.temperature > 35 ? 'caution' : 'safe'
    }

    const unsafeCount = Object.values(factors).filter(f => f === 'unsafe').length
    const cautionCount = Object.values(factors).filter(f => f === 'caution').length

    let overall: FlightConditions['overall']
    if (unsafeCount > 0) overall = 'dangerous'
    else if (cautionCount >= 2) overall = 'poor'
    else if (cautionCount === 1) overall = 'fair'
    else if (weather.windSpeed < 5 && weather.visibility > 10) overall = 'excellent'
    else overall = 'good'

    const recommendations: string[] = []
    const restrictions: string[] = []

    if (factors.wind === 'unsafe') {
      restrictions.push('High winds - all flights suspended')
    } else if (factors.wind === 'caution') {
      recommendations.push('Monitor wind gusts carefully')
      recommendations.push('Consider reducing flight altitude')
    }

    if (factors.visibility === 'unsafe') {
      restrictions.push('Poor visibility - no flights authorized')
    } else if (factors.visibility === 'caution') {
      recommendations.push('Maintain visual contact at all times')
      recommendations.push('Reduce flight distance from operator')
    }

    if (factors.precipitation === 'unsafe') {
      restrictions.push('Heavy precipitation - flights prohibited')
    } else if (factors.precipitation === 'caution') {
      recommendations.push('Light precipitation detected - exercise caution')
    }

    if (overall === 'excellent') {
      recommendations.push('Ideal flying conditions')
      recommendations.push('Perfect for extended missions')
    }

    return { overall, factors, recommendations, restrictions }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'dangerous': return 'text-red-600 bg-red-100'
      case 'safe': return 'text-green-600 bg-green-100'
      case 'caution': return 'text-yellow-600 bg-yellow-100'
      case 'unsafe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weather Command</h1>
          <p className="mt-2 text-gray-600">Real-time weather monitoring and flight safety assessment</p>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {currentWeather && (
          <>
            {/* Current Conditions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Current Conditions</h2>
                    <p className="text-sm text-gray-600">{currentWeather.location}</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{currentWeather.temperature.toFixed(1)}°C</div>
                        <div className="text-sm text-gray-600">Temperature</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{currentWeather.windSpeed.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Wind Speed (km/h)</div>
                        <div className="text-xs text-gray-500">{currentWeather.windDirection}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{currentWeather.humidity.toFixed(0)}%</div>
                        <div className="text-sm text-gray-600">Humidity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{currentWeather.visibility.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Visibility (km)</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-600">Precipitation</div>
                        <div className="font-semibold">{currentWeather.precipitation.toFixed(1)} mm</div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-600">Pressure</div>
                        <div className="font-semibold">{currentWeather.pressure.toFixed(0)} hPa</div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-600">UV Index</div>
                        <div className="font-semibold">{currentWeather.uvIndex}</div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-600">Dew Point</div>
                        <div className="font-semibold">{currentWeather.dewPoint.toFixed(1)}°C</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Safety Assessment */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Flight Safety</h2>
                </div>
                <div className="p-6">
                  {flightConditions && (
                    <>
                      <div className="text-center mb-6">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getConditionColor(flightConditions.overall)}`}>
                          {flightConditions.overall.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Wind</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(flightConditions.factors.wind)}`}>
                            {flightConditions.factors.wind}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Visibility</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(flightConditions.factors.visibility)}`}>
                            {flightConditions.factors.visibility}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precipitation</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(flightConditions.factors.precipitation)}`}>
                            {flightConditions.factors.precipitation}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Temperature</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(flightConditions.factors.temperature)}`}>
                            {flightConditions.factors.temperature}
                          </span>
                        </div>
                      </div>

                      {flightConditions.recommendations.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                          <ul className="text-xs text-green-700 space-y-1">
                            {flightConditions.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flightConditions.restrictions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Restrictions</h4>
                          <ul className="text-xs text-red-700 space-y-1">
                            {flightConditions.restrictions.map((rest, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-1">⚠</span>
                                {rest}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 24-Hour Trend */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">24-Hour Weather Trend</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {weatherData.slice(-8).map((weather, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">{formatTime(weather.timestamp)}</div>
                      <div className="text-lg font-semibold text-blue-600">{weather.temperature.toFixed(0)}°</div>
                      <div className="text-xs text-green-600">{weather.windSpeed.toFixed(0)} km/h</div>
                      <div className="text-xs text-purple-600">{weather.humidity.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">{weather.conditions}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Alerts */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Weather Alerts & Notifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {currentWeather.windSpeed > 15 && (
                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Wind Advisory</h4>
                        <p className="text-sm text-yellow-700">Current wind speed: {currentWeather.windSpeed.toFixed(1)} km/h. Exercise caution during flight operations.</p>
                      </div>
                    </div>
                  )}

                  {currentWeather.visibility < 5 && (
                    <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-orange-800">Visibility Alert</h4>
                        <p className="text-sm text-orange-700">Low visibility conditions: {currentWeather.visibility.toFixed(1)} km. Maintain visual contact with aircraft.</p>
                      </div>
                    </div>
                  )}

                  {flightConditions?.overall === 'excellent' && (
                    <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Optimal Conditions</h4>
                        <p className="text-sm text-green-700">Perfect weather for drone operations. All mission types approved.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}