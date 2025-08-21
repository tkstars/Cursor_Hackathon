import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet'
import { AlertTriangle, Construction, Ban, HelpCircle, MapPin, Moon, Sun, BarChart3, X, Navigation, Shield, Zap } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'
import './App.css'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Hamburg city center coordinates
const HAMBURG_CENTER = [53.5511, 9.9937]

// Hazard types configuration
const HAZARD_TYPES = {
  blocked_lane: {
    name: 'Blocked Lane',
    icon: '🚫',
    color: '#EF4444', // red
    severity: 'high'
  },
  dangerous_crossing: {
    name: 'Dangerous Crossing',
    icon: '⚠️',
    color: '#F97316', // orange
    severity: 'medium'
  },
  construction: {
    name: 'Construction',
    icon: '🚧',
    color: '#F59E0B', // yellow
    severity: 'medium'
  },
  unclear_route: {
    name: 'Unclear Route',
    icon: '❓',
    color: '#3B82F6', // blue
    severity: 'low'
  }
}

// Component to handle map resizing
function MapResizer() {
  const map = useMap()
  
  useEffect(() => {
    // Force map to recalculate its size after a short delay
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    
    // Also invalidate on window resize
    const handleResize = () => {
      map.invalidateSize()
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [map])
  
  return null
}

// Component to handle map clicks for adding hazards and route points
function MapClickHandler({ onMapClick, isAddingHazard, isSettingRoute, onRoutePointClick }) {
  useMapEvents({
    click: (e) => {
      if (isAddingHazard) {
        onMapClick(e.latlng)
      } else if (isSettingRoute) {
        onRoutePointClick(e.latlng)
      }
    }
  })
  return null
}

// Route segment component with safety colors
function RouteSegment({ segment, onClick }) {
  const colors = {
    safe: '#10B981',    // green
    medium: '#F59E0B',  // yellow
    dangerous: '#EF4444' // red
  }
  
  // Don't render if segment is filtered out
  if (segment.visible === false) return null
  
  return (
    <Polyline
      positions={segment.points}
      color={colors[segment.safety]}
      weight={6}
      opacity={segment.opacity || 0.8}
      dashArray={segment.safety === 'dangerous' && segment.opacity < 0.5 ? '10, 10' : null}
      eventHandlers={{
        click: () => onClick(segment)
      }}
    />
  )
}

// Routing control component
function RoutingControl({ start, end, mode, hazards, riskTolerance, onRouteFound }) {
  const map = useMap()
  
  useEffect(() => {
    if (!start || !end) return
    
    // Calculate waypoints to avoid hazards in safest mode
    let waypoints = [
      L.latLng(start.lat, start.lng),
      L.latLng(end.lat, end.lng)
    ]
    
    // In safest mode, add intermediate waypoints to avoid dangerous areas
    if (mode === 'safest' && hazards.length > 0) {
      // Find high-risk hazards
      const dangerousHazards = hazards.filter(h => h.severity === 'high' || h.severity === 'medium')
      
      if (dangerousHazards.length > 0) {
        const avoidanceWaypoints = []
        
        // Create a grid of potential waypoints
        const latStep = (end.lat - start.lat) / 4
        const lngStep = (end.lng - start.lng) / 4
        
        for (let i = 1; i < 4; i++) {
          const checkLat = start.lat + (latStep * i)
          const checkLng = start.lng + (lngStep * i)
          
          // Check if this point is near any hazards
          const nearbyHazards = dangerousHazards.filter(h => {
            const distance = Math.sqrt(
              Math.pow(h.lat - checkLat, 2) + 
              Math.pow(h.lng - checkLng, 2)
            ) * 111000
            return distance < 500 // Within 500m
          })
          
          if (nearbyHazards.length > 0) {
            // Calculate avoidance waypoint
            let offsetLat = 0
            let offsetLng = 0
            
            nearbyHazards.forEach(h => {
              // Move away from hazard
              const diffLat = checkLat - h.lat
              const diffLng = checkLng - h.lng
              const dist = Math.sqrt(diffLat * diffLat + diffLng * diffLng)
              
              if (dist > 0) {
                offsetLat += (diffLat / dist) * 0.003
                offsetLng += (diffLng / dist) * 0.003
              }
            })
            
            avoidanceWaypoints.push(L.latLng(
              checkLat + offsetLat,
              checkLng + offsetLng
            ))
          }
        }
        
        // Build final waypoints
        waypoints = [L.latLng(start.lat, start.lng)]
        if (avoidanceWaypoints.length > 0) {
          waypoints = waypoints.concat(avoidanceWaypoints)
        }
        waypoints.push(L.latLng(end.lat, end.lng))
      }
    }
    
    // Create routing control with calculated waypoints
    const control = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: 'transparent', weight: 0 }] // Hide default route line
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'bike' // Use bike routing
      })
    })
    
    // Handle route found
    control.on('routesfound', (e) => {
      const route = e.routes[0]
      const coordinates = route.coordinates
      
      // Create safety segments based on hazard proximity
      const segments = createSafetySegments(coordinates, hazards)
      
      // Apply different visualizations based on mode
      const processedSegments = segments.map(segment => {
        if (mode === 'safest') {
          // In safest mode, emphasize dangerous segments
          return {
            ...segment,
            visible: true,
            opacity: segment.safety === 'dangerous' ? 0.3 : 0.8
          }
        } else {
          // In fastest mode, show all segments equally
          return {
            ...segment,
            visible: true,
            opacity: 0.8
          }
        }
      })
      
      onRouteFound(processedSegments)
    })
    
    control.on('routingerror', (e) => {
      console.error('Routing error:', e)
      onRouteFound([])
    })
    
    control.addTo(map)
    
    return () => {
      map.removeControl(control)
    }
  }, [start, end, mode, hazards, riskTolerance, map, onRouteFound])
  
  return null
}

// Helper function to create safety segments based on nearby hazards
function createSafetySegments(coordinates, hazards) {
  // For demo: divide route into segments and assess safety based on nearby hazards
  const segmentLength = Math.floor(coordinates.length / 8)
  const segments = []
  
  for (let i = 0; i < 8; i++) {
    const startIdx = i * segmentLength
    const endIdx = i === 7 ? coordinates.length : (i + 1) * segmentLength
    const points = coordinates.slice(startIdx, endIdx).map(c => [c.lat, c.lng])
    
    // Calculate center point of segment
    const centerIdx = Math.floor((startIdx + endIdx) / 2)
    const centerPoint = coordinates[centerIdx]
    
    // Check for nearby hazards (within ~500m)
    let nearbyHazards = 0
    let highSeverityHazards = 0
    
    if (hazards && centerPoint) {
      hazards.forEach(hazard => {
        const distance = Math.sqrt(
          Math.pow(hazard.lat - centerPoint.lat, 2) + 
          Math.pow(hazard.lng - centerPoint.lng, 2)
        ) * 111000 // Rough conversion to meters
        
        if (distance < 500) {
          nearbyHazards++
          if (hazard.severity === 'high') {
            highSeverityHazards++
          }
        }
      })
    }
    
    // Determine safety based on nearby hazards
    let safety = 'safe'
    let info = 'Well-maintained bike lane with good visibility'
    
    if (highSeverityHazards > 0 || nearbyHazards > 2) {
      safety = 'dangerous'
      info = nearbyHazards > 2 ? 
        `Multiple hazards reported in this area (${nearbyHazards} hazards)` :
        'High-risk hazard nearby - use caution'
    } else if (nearbyHazards > 0) {
      safety = 'medium'
      info = `${nearbyHazards} hazard${nearbyHazards > 1 ? 's' : ''} reported nearby`
    }
    
    segments.push({
      id: `segment-${i}`,
      points,
      safety,
      info
    })
  }
  
  return segments
}

// Get info text for segment
function getSegmentInfo(safety) {
  const infos = {
    safe: 'Well-maintained bike lane with good visibility',
    medium: 'Shared road with moderate traffic',
    dangerous: 'High traffic area with no bike lane'
  }
  return infos[safety]
}

// Custom marker component with animation
function HazardMarker({ hazard, isNew }) {
  const hazardType = HAZARD_TYPES[hazard.type]
  
  const customIcon = L.divIcon({
    html: `<div class="${isNew ? 'hazard-marker-new' : ''}" style="font-size: 24px;">${hazardType.icon}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  return (
    <Marker position={[hazard.lat, hazard.lng]} icon={customIcon}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-1">{hazardType.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{hazard.description}</p>
          <p className="text-xs text-gray-500">
            Reported: {new Date(hazard.timestamp).toLocaleDateString()}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

function App() {
  const [hazards, setHazards] = useState([])
  const [isAddingHazard, setIsAddingHazard] = useState(false)
  const [selectedType, setSelectedType] = useState('blocked_lane')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(null)
  const [toast, setToast] = useState(null)
  const [showRouting, setShowRouting] = useState(false)
  const [routeStart, setRouteStart] = useState(null)
  const [routeEnd, setRouteEnd] = useState(null)
  const [routeMode, setRouteMode] = useState('safest') // 'fastest' or 'safest'
  const [routeSegments, setRouteSegments] = useState([])
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [riskTolerance, setRiskTolerance] = useState(1) // 1-5 scale
  const [showWelcome, setShowWelcome] = useState(true)
  const mapRef = useRef(null)
  const routingControlRef = useRef(null)

  // Demo data for presentation - realistic Hamburg cycling hazards
  const DEMO_HAZARDS = [
    {
      id: 'demo-1',
      lat: 53.5511,
      lng: 9.9937,
      type: 'blocked_lane',
      severity: 'high',
      description: 'Daily 7-10am: Delivery trucks completely block bike lane at Rathausmarkt. Cyclists forced into heavy traffic.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: 'demo-2',
      lat: 53.5502, // Near Hauptbahnhof
      lng: 10.0069,
      type: 'dangerous_crossing',
      severity: 'high',
      description: 'ACCIDENT HOTSPOT: 3 cyclist injuries this month. Cars turn right without checking bike lane.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    {
      id: 'demo-3',
      lat: 53.5579, // Schanzenviertel
      lng: 9.9635,
      type: 'construction',
      severity: 'medium',
      description: 'Until Dec 2024: Schulterblatt bike lane closed. Detour through narrow side streets with parked cars.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: 'demo-4',
      lat: 53.5688, // Rotherbaum
      lng: 9.9872,
      type: 'unclear_route',
      severity: 'low',
      description: 'Confusing intersection: bike lane splits into 3 directions with no signage. Many cyclists take wrong turn.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: 'demo-5',
      lat: 53.5455, // HafenCity
      lng: 9.9991,
      type: 'blocked_lane',
      severity: 'high',
      description: 'Construction vehicles park across entire bike path. No safe alternative route available.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
      id: 'demo-6',
      lat: 53.5835, // Eppendorf
      lng: 9.9859,
      type: 'dangerous_crossing',
      severity: 'medium',
      description: 'Blind corner at Eppendorfer Landstraße. Cars exit parking garage without seeing cyclists.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
    },
    {
      id: 'demo-7',
      lat: 53.5403, // St. Pauli
      lng: 9.9695,
      type: 'blocked_lane',
      severity: 'high',
      description: 'Weekend nights: Taxis queue in bike lane near Reeperbahn. Very dangerous with drunk pedestrians.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
    },
    {
      id: 'demo-8',
      lat: 53.5943, // Barmbek
      lng: 10.0445,
      type: 'construction',
      severity: 'medium',
      description: 'U-Bahn construction: bike lane redirected through gravel path. Difficult for road bikes.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      id: 'demo-9',
      lat: 53.5765, // Hoheluft
      lng: 9.9701,
      type: 'unclear_route',
      severity: 'low',
      description: 'Bike lane marking worn off. Unclear if cyclists should use road or sidewalk.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: 'demo-10',
      lat: 53.5621, // Neustadt
      lng: 9.9852,
      type: 'dangerous_crossing',
      severity: 'high',
      description: 'No traffic light for bikes! Cyclists must cross 4 lanes of fast traffic. Multiple near-misses daily.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
    }
  ]

  // Load hazards and preferences from localStorage on mount
  useEffect(() => {
    const savedHazards = localStorage.getItem('hh-bikewatch-hazards')
    if (savedHazards) {
      setHazards(JSON.parse(savedHazards))
    } else {
      // Load demo data if no saved hazards
      setHazards(DEMO_HAZARDS)
      localStorage.setItem('hh-bikewatch-hazards', JSON.stringify(DEMO_HAZARDS))
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('hh-bikewatch-darkmode')
    if (savedDarkMode === 'true') {
      setIsDarkMode(true)
    }
  }, [])

  // Save hazards to localStorage whenever they change
  useEffect(() => {
    if (hazards.length > 0) {
      localStorage.setItem('hh-bikewatch-hazards', JSON.stringify(hazards))
    }
  }, [hazards])
  
  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('hh-bikewatch-darkmode', isDarkMode.toString())
  }, [isDarkMode])

  const handleMapClick = (latlng) => {
    if (!isAddingHazard) return

    const newHazard = {
      id: Date.now().toString(),
      lat: latlng.lat,
      lng: latlng.lng,
      type: selectedType,
      severity: HAZARD_TYPES[selectedType].severity,
      description: `${HAZARD_TYPES[selectedType].name} reported by user`,
      timestamp: new Date().toISOString()
    }

    setHazards([...hazards, newHazard])
    setIsAddingHazard(false)
    setRecentlyAdded(newHazard.id)
    
    // Show success toast
    setToast({
      message: 'Hazard reported successfully!',
      type: 'success'
    })
    
    // Remove the animation class after animation completes
    setTimeout(() => setRecentlyAdded(null), 1000)
    
    // Remove toast after 3 seconds
    setTimeout(() => setToast(null), 3000)
  }
  
  // Handle route point clicks
  const handleRoutePointClick = (latlng) => {
    if (!showRouting) return
    
    if (!routeStart) {
      setRouteStart(latlng)
      setToast({
        message: 'Start point set. Now click the destination.',
        type: 'success'
      })
    } else if (!routeEnd) {
      setRouteEnd(latlng)
      setToast({
        message: 'Route is being calculated...',
        type: 'success'
      })
    }
    
    setTimeout(() => setToast(null), 2000)
  }
  
  // Handle route found
  const handleRouteFound = (segments) => {
    setRouteSegments(segments)
    
    // Count dangerous segments
    const dangerousCount = segments.filter(s => s.safety === 'dangerous').length
    const totalSegments = segments.length
    
    // Apply mode-specific filtering
    if (routeMode === 'safest') {
      setToast({
        message: dangerousCount > 0 
          ? `Safest route calculated - avoiding ${dangerousCount} dangerous areas!`
          : 'Safest route calculated - all clear!',
        type: 'success'
      })
    } else {
      setToast({
        message: dangerousCount > 0
          ? `Fastest route calculated - passes through ${dangerousCount} risk areas`
          : 'Fastest route calculated!',
        type: 'success'
      })
    }
    
    setTimeout(() => setToast(null), 3000)
  }
  
  // Handle segment click
  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment)
  }

  // Calculate statistics
  const stats = {
    total: hazards.length,
    highRisk: hazards.filter(h => h.severity === 'high').length,
    todayReports: hazards.filter(h => {
      const today = new Date().toDateString()
      return new Date(h.timestamp).toDateString() === today
    }).length,
    mostDangerous: Object.entries(
      hazards.reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-900' : 'bg-hamburg-blue'} text-white p-4 shadow-xl transition-colors duration-300`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HH-BikeWatch</h1>
              <p className="text-xs opacity-90">Hamburg Cycling Safety Map</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2.5 rounded-lg transition-all transform hover:scale-105 ${
                showStats
                  ? 'bg-white text-hamburg-blue'
                  : isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Show Statistics"
            >
              <BarChart3 size={20} />
            </button>
            
            {/* Route Planner Button */}
            <button
              onClick={() => setShowRouting(!showRouting)}
              className={`p-2.5 rounded-lg transition-all transform hover:scale-105 ${
                showRouting
                  ? 'bg-white text-hamburg-blue'
                  : isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Route Planner"
            >
              <Navigation size={20} />
            </button>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg transition-all transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 shadow-md border-b transition-colors duration-300`}>
        <div className="container mx-auto">
          {showRouting ? (
            // Route Planning Controls
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Plan Route:
                </span>
                <button
                  onClick={() => {
                    setRouteStart(null)
                    setRouteEnd(null)
                    setRouteSegments([])
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    // Demo route from Altona to St. Georg through city center
                    setRouteStart({ lat: 53.5495, lng: 9.9355 }) // Altona
                    setRouteEnd({ lat: 53.5543, lng: 10.0099 }) // St. Georg
                    setRouteSegments([])
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    isDarkMode 
                      ? 'bg-blue-700 hover:bg-blue-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Demo Route
                </button>
                <button
                  onClick={() => {
                    setShowRouting(false)
                    setRouteStart(null)
                    setRouteEnd(null)
                    setRouteSegments([])
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    isDarkMode 
                      ? 'bg-red-700 hover:bg-red-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  Cancel
                </button>
              </div>
              
              {/* Route Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    setRouteMode('safest')
                    // Clear segments to force recalculation
                    if (routeStart && routeEnd) {
                      setRouteSegments([])
                    }
                  }}
                  className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                    routeMode === 'safest'
                      ? 'bg-green-500 text-white'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Shield size={16} />
                  Safest
                </button>
                <button
                  onClick={() => {
                    setRouteMode('fastest')
                    // Clear segments to force recalculation
                    if (routeStart && routeEnd) {
                      setRouteSegments([])
                    }
                  }}
                  className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                    routeMode === 'fastest'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Zap size={16} />
                  Fastest
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {!routeStart && '1. Click start point'}
                  {routeStart && !routeEnd && '2. Click end point'}
                  {routeStart && routeEnd && routeSegments.length === 0 && 'Calculating route...'}
                  {routeStart && routeEnd && routeSegments.length > 0 && 
                    `${routeMode === 'safest' ? 'Safest' : 'Fastest'} route active`}
                </span>
              </div>
              
              {/* Risk Tolerance Slider */}
              <div className="flex items-center gap-3 ml-auto">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Risk Level:
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(Number(e.target.value))}
                  className="w-32"
                />
                <span className={`text-sm font-medium ${
                  riskTolerance <= 2 ? 'text-green-500' :
                  riskTolerance <= 3 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {riskTolerance <= 2 ? 'Very Safe' :
                   riskTolerance <= 3 ? 'Balanced' :
                   'Fast Route'}
                </span>
              </div>
            </div>
          ) : (
            // Default Controls
            <div className="flex flex-wrap items-center gap-4">
              {/* Add Hazard Button */}
              <button
                onClick={() => setIsAddingHazard(!isAddingHazard)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md ${
                  isAddingHazard 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30' 
                    : 'bg-hamburg-blue text-white hover:bg-blue-700 shadow-hamburg-blue/30'
                }`}
              >
                {isAddingHazard ? '✕ Cancel' : '⚠ Report Hazard'}
              </button>

              {/* Hazard Type Selector */}
              {isAddingHazard && (
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hamburg-blue"
                >
                  {Object.entries(HAZARD_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Instructions */}
              {isAddingHazard && (
                <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click on the map to add a hazard
                </p>
              )}

              {/* Hazard Count */}
              <div className="ml-auto flex items-center gap-3">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hazards.length} hazards reported
                </span>
                
                {/* Clear Data Button (for demo purposes) */}
                <button
                  onClick={() => {
                    if (confirm('Clear all hazards and reset to demo data?')) {
                      localStorage.removeItem('hh-bikewatch-hazards')
                      setHazards(DEMO_HAZARDS)
                      localStorage.setItem('hh-bikewatch-hazards', JSON.stringify(DEMO_HAZARDS))
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Reset Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className={`map-container flex-1 ${isAddingHazard ? 'adding-hazard' : ''}`}>
        <MapContainer
          center={HAMBURG_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapResizer />
          <MapClickHandler 
            onMapClick={handleMapClick} 
            isAddingHazard={isAddingHazard}
            isSettingRoute={showRouting}
            onRoutePointClick={handleRoutePointClick}
          />
          
          {/* Routing Control */}
          {showRouting && (
            <RoutingControl
              start={routeStart}
              end={routeEnd}
              mode={routeMode}
              hazards={hazards}
              riskTolerance={riskTolerance}
              onRouteFound={handleRouteFound}
            />
          )}
          
          {/* Route Segments */}
          {routeSegments.map(segment => (
            <RouteSegment
              key={segment.id}
              segment={segment}
              onClick={handleSegmentClick}
            />
          ))}
          
          {/* Route Start/End Markers */}
          {routeStart && (
            <Marker position={[routeStart.lat, routeStart.lng]}>
              <Popup>Start Point</Popup>
            </Marker>
          )}
          {routeEnd && (
            <Marker position={[routeEnd.lat, routeEnd.lng]}>
              <Popup>End Point</Popup>
            </Marker>
          )}
          
          {/* Render all hazard markers */}
          {hazards.map(hazard => (
            <HazardMarker 
              key={hazard.id} 
              hazard={hazard} 
              isNew={hazard.id === recentlyAdded}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-gray-900/95 text-white' : 'bg-white/95'} backdrop-blur-sm p-4 rounded-xl shadow-xl z-[1000] transition-colors duration-300 max-w-xs`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">📍</span> Legend
          </h3>
          <div className="space-y-2">
            {showRouting ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-1 bg-green-500"></div>
                  <span>Safe Route</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-1 bg-yellow-500"></div>
                  <span>Moderate Risk</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-1 bg-red-500"></div>
                  <span>Dangerous</span>
                </div>
                {routeMode === 'safest' && (
                  <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t">
                    <Shield size={14} className="text-green-500" />
                    <span className="text-xs">Avoiding hazards</span>
                  </div>
                )}
              </>
            ) : (
              Object.entries(HAZARD_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{type.icon}</span>
                  <span className={isDarkMode ? 'text-gray-300' : ''}>{type.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Segment Info Popup */}
        {selectedSegment && (
          <div className={`absolute top-20 right-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-lg z-[1000] max-w-xs`}>
            <button
              onClick={() => setSelectedSegment(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <h4 className="font-bold mb-2">Route Segment Info</h4>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
              selectedSegment.safety === 'safe' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
              selectedSegment.safety === 'medium' ? (isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
              (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
            }`}>
              {selectedSegment.safety.toUpperCase()}
            </div>
            <p className="text-sm">{selectedSegment.info}</p>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      <div className={`fixed right-0 top-0 h-full w-80 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'} shadow-2xl transform transition-transform duration-300 z-[2000] ${showStats ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Statistics</h2>
            <button
              onClick={() => setShowStats(false)}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X size={20} />
        </button>
          </div>
          
          {/* Stats Cards */}
          <div className="space-y-4">
            {/* Total Hazards */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hazards</div>
            </div>
            
            {/* High Risk */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
              <div className="text-3xl font-bold text-red-500">{stats.highRisk}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Risk Areas</div>
            </div>
            
            {/* Today's Reports */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
              <div className="text-3xl font-bold text-green-500">{stats.todayReports}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reported Today</div>
            </div>
            
            {/* Most Common Hazard */}
            {stats.mostDangerous && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'}`}>
                <div className="text-lg font-bold">{HAZARD_TYPES[stats.mostDangerous[0]]?.name || 'N/A'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Most Common ({stats.mostDangerous[1]} reports)</div>
              </div>
            )}
          </div>
          
          {/* Hazard Breakdown */}
          <div className="mt-6">
            <h3 className="font-bold mb-3">Hazard Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(HAZARD_TYPES).map(([key, type]) => {
                const count = hazards.filter(h => h.type === key).length
                const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(0) : 0
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span className="text-sm">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-24 h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div 
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: type.color
                          }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-[3000] ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <span>✓</span>}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all animate-fade-in-up`}>
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <span className="text-4xl">🚴</span> Welcome to HH-BikeWatch!
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Making Hamburg cycling safer together - one report at a time.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📍</span> View Hazards
                </h3>
                <p className="text-sm opacity-80">
                  See real-time reports from fellow cyclists. Click any marker for details.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> Report Dangers
                </h3>
                <p className="text-sm opacity-80">
                  Click "Report Hazard" then tap the map to warn others about unsafe areas.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🧭</span> Plan Safe Routes
                </h3>
                <p className="text-sm opacity-80">
                  Use the navigation tool to find the safest path avoiding reported hazards.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📊</span> Track Progress
                </h3>
                <p className="text-sm opacity-80">
                  View statistics to see Hamburg's most dangerous areas for cyclists.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-60">
                {DEMO_HAZARDS.length} hazards already reported
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="px-6 py-3 bg-hamburg-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 hover-lift"
              >
                Start Exploring →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App