"use client";

import { useEffect, useRef, useState } from "react";

interface Item {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  condition?: string;
  owner_name?: string;
  ownerName?: string;
  images?: string[];
}

interface GoogleMapProps {
  items: Item[];
}

export default function GoogleMapComponent({ items }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      setError("Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local");
      return;
    }

    // Check if already loaded
    if ((window as any).google?.maps) {
      initializeMap();
      return;
    }

    // Load via script tag
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    script.onerror = () => setError("Failed to load Google Maps. Check your API key.");
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed for script tag
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && (window as any)._localgiftMap) {
      addMarkers((window as any)._localgiftMap);
    }
  }, [items, mapLoaded]);

  function initializeMap() {
    if (!mapRef.current) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    let center = { lat: 28.6139, lng: 77.2090 };

    const createMap = (pos: { lat: number; lng: number }) => {
      if (!mapRef.current) return;

      const map = new g.maps.Map(mapRef.current, {
        center: pos,
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });

      // User location blue dot
      new g.maps.Marker({
        map,
        position: pos,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
        },
        title: "Your Location",
        zIndex: 999,
      });

      (window as any)._localgiftMap = map;
      addMarkers(map);
      setMapLoaded(true);
    };

    // Render map instantly to prevent perpetual "Loading map..." screen if geolocation times out entirely
    createMap(center);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const map = (window as any)._localgiftMap;
        if (map) {
          map.setCenter(userLoc);
          map.setZoom(14);

          new g.maps.Marker({
            map,
            position: userLoc,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 3,
            },
            title: "You are here",
            zIndex: 999,
          });

          const infoWindow = new g.maps.InfoWindow({
            content: `<div style="font-weight: bold; color: #4285F4;">📍 You are here!</div><div style="font-size: 11px; color: #666;">Your exact device location</div>`
          });
          infoWindow.setPosition(userLoc);
          infoWindow.open(map);
        }
      },
      () => { },
      { timeout: 7000 }
    );
  }

  function addMarkers(map: any) {
    const g = (window as any).google;
    if (!g?.maps) return;

    const infoWindow = new g.maps.InfoWindow();

    items.forEach(item => {
      if (!item.latitude || !item.longitude) return;

      const marker = new g.maps.Marker({
        map,
        position: { lat: item.latitude, lng: item.longitude },
        title: item.title,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#e74c3c",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      const ownerName = item.owner_name || item.ownerName || "User";
      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="max-width:220px;font-family:system-ui,sans-serif;padding:4px 0;">
            <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${item.title}</h3>
            <p style="margin:0;font-size:12px;color:#666;">${item.condition || 'Good'} &bull; by ${ownerName}</p>
            <a href="/item/${item.id}" style="display:inline-block;margin-top:8px;padding:5px 14px;background:#7c3aed;color:white;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500;">View Item &rarr;</a>
          </div>
        `);
        infoWindow.open(map, marker);
      });
    });
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 p-8">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
}
