import { cn } from '@/lib/utils';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  className?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  showMarker?: boolean;
  markerPosition?: [number, number]; // [lng, lat]
  onMapClick?: (lngLat: [number, number]) => void;
  height?: string;
}

export function MapComponent({
  className,
  center = [77.5946, 12.9716], // Bangalore, India default
  zoom = 12,
  showMarker = false,
  markerPosition,
  onMapClick,
  height = '400px',
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with OpenStreetMap style for clear visibility
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    // Map loaded event
    map.current.on('load', () => {
      setIsLoading(false);
    });

    // Handle map clicks
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({ center, zoom, duration: 1000 });
    }
  }, [center, zoom]);

  // Handle marker
  useEffect(() => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }

    // Add new marker if showMarker is true
    if (showMarker && markerPosition) {
      marker.current = new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat(markerPosition)
        .addTo(map.current);
    }
  }, [showMarker, markerPosition]);

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
