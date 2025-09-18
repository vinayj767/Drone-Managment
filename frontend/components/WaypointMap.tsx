'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Waypoint } from '@/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WaypointMapProps {
  waypoints: Waypoint[];
  polygon?: number[][];
  onWaypointsChange?: (waypoints: Waypoint[]) => void;
  onPolygonChange?: (polygon: number[][]) => void;
  mode?: 'edit' | 'view';
  center?: [number, number];
  zoom?: number;
  className?: string;
}

function MapEvents({ onWaypointsChange, waypoints, mode }: {
  onWaypointsChange?: (waypoints: Waypoint[]) => void;
  waypoints: Waypoint[];
  mode?: string;
}) {
  useMapEvents({
    click: (e) => {
      if (mode === 'edit' && onWaypointsChange) {
        const newWaypoint: Waypoint = {
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          altitude: 100, // Default altitude
          order: waypoints.length
        };
        onWaypointsChange([...waypoints, newWaypoint]);
      }
    }
  });
  
  return null;
}

export default function WaypointMap({
  waypoints,
  polygon = [],
  onWaypointsChange,
  onPolygonChange,
  mode = 'view',
  center = [37.7749, -122.4194], // San Francisco default
  zoom = 13,
  className = ''
}: WaypointMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
      <div className="spinner"></div>
      <span className="ml-2">Loading map...</span>
    </div>;
  }

  const clearWaypoints = () => {
    if (onWaypointsChange) {
      onWaypointsChange([]);
    }
  };

  const removeWaypoint = (index: number) => {
    if (onWaypointsChange) {
      const newWaypoints = waypoints.filter((_, i) => i !== index)
        .map((wp, i) => ({ ...wp, order: i }));
      onWaypointsChange(newWaypoints);
    }
  };

  return (
    <div className={`relative h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents 
          onWaypointsChange={onWaypointsChange}
          waypoints={waypoints}
          mode={mode}
        />

        {/* Render waypoints */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={[waypoint.latitude, waypoint.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <p><strong>Waypoint {index + 1}</strong></p>
                <p>Lat: {waypoint.latitude.toFixed(6)}</p>
                <p>Lng: {waypoint.longitude.toFixed(6)}</p>
                <p>Alt: {waypoint.altitude}m</p>
                {mode === 'edit' && (
                  <button
                    onClick={() => removeWaypoint(index)}
                    className="mt-2 text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map controls */}
      {mode === 'edit' && (
        <div className="absolute top-2 right-2 z-[1000] space-y-2">
          <button
            onClick={clearWaypoints}
            className="block px-3 py-1 bg-red-600 text-white text-xs rounded shadow hover:bg-red-700"
            disabled={waypoints.length === 0}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}