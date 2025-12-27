import { cn } from '@/lib/utils';
import { Incident } from '@/types/incident';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

interface IncidentMapProps {
  className?: string;
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  height?: string;
}

export function IncidentMap({
  className,
  incidents,
  onIncidentClick,
  height = '600px',
}: IncidentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Severity colors
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // red
      case 'high':
        return '#f97316'; // orange
      case 'medium':
        return '#eab308'; // yellow
      case 'low':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

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
      center: [77.5946, 12.9716], // Bangalore default
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      // Clean up markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    incidents.forEach((incident) => {
      if (!incident.location?.lat || !incident.location?.lng) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getSeverityColor(incident.severity);
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.transition = 'transform 0.2s';

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${incident.title}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${incident.location.address}</p>
          <div style="display: flex; gap: 8px; font-size: 11px; margin-top: 8px;">
            <span style="padding: 2px 8px; background: ${getSeverityColor(incident.severity)}; color: white; border-radius: 4px; text-transform: capitalize;">
              ${incident.severity}
            </span>
            <span style="padding: 2px 8px; background: #e5e7eb; color: #374151; border-radius: 4px; text-transform: capitalize;">
              ${incident.status}
            </span>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle click
      el.addEventListener('click', () => {
        if (onIncidentClick) {
          onIncidentClick(incident);
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (incidents.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      incidents.forEach((incident) => {
        if (incident.location?.lat && incident.location?.lng) {
          bounds.extend([incident.location.lng, incident.location.lat]);
        }
      });
      
      if (!bounds.isEmpty()) {
        map.current?.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14,
          duration: 1000,
        });
      }
    }
  }, [incidents, isLoading, onIncidentClick]);

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
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-xs mb-2">Severity</h4>
        <div className="space-y-1">
          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <div key={severity} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: getSeverityColor(severity) }}
              />
              <span className="capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident count */}
      {!isLoading && (
        <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold">
            {incidents.length} {incidents.length === 1 ? 'Incident' : 'Incidents'}
          </p>
        </div>
      )}
    </div>
  );
}
