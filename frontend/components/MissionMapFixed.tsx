'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface Mission {
  _id: string;
  name: string;
  status: string;
  droneId?: { name: string };
  waypoints: { lat: number; lng: number }[];
}

interface MissionMapProps {
  missions: Mission[];
  onMissionSelect: (mission: Mission) => void;
}

// Dynamic import for the Map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="spinner"></div>
      <span className="ml-2">Loading map...</span>
    </div>
  ),
});

const MissionMap: React.FC<MissionMapProps> = ({ missions, onMissionSelect }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="spinner"></div>
        <span className="ml-2">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <DynamicMap missions={missions} onMissionSelect={onMissionSelect} />
    </div>
  );
};

export default MissionMap;