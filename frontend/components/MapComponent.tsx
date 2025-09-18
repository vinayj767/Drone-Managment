'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Mission {
  _id: string;
  name: string;
  status: string;
  droneId?: { name: string };
  waypoints: { lat: number; lng: number }[];
}

interface MapComponentProps {
  missions: Mission[];
  onMissionSelect: (mission: Mission) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ missions, onMissionSelect }) => {
  return (
    <MapContainer
      center={[40.7128, -74.0060]} // New York default
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {missions.map((mission) => {
        const firstWaypoint = mission.waypoints?.[0];
        if (!firstWaypoint) return null;
        
        return (
          <Marker
            key={mission._id}
            position={[firstWaypoint.lat, firstWaypoint.lng]}
            eventHandlers={{
              click: () => onMissionSelect(mission),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold text-sm">{mission.name}</h3>
                <p className="text-sm">Status: {mission.status}</p>
                <p className="text-sm">Drone: {mission.droneId?.name || 'Unassigned'}</p>
                <p className="text-sm">Waypoints: {mission.waypoints.length}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;