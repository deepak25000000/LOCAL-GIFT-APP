"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Item } from "@/types";

// We use the Cesium library directly (not resium) for maximum control in Next.js
let Cesium: any = null;

export default function MapContent({ items }: { items: Item[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);

    // Default center — New Delhi
    const defaultCenter = useMemo(() => {
        if (items && items.length > 0 && items[0].latitude) {
            return { lat: items[0].latitude, lng: items[0].longitude };
        }
        return { lat: 28.6139, lng: 77.2090 };
    }, [items]);

    useEffect(() => {
        let mounted = true;

        async function initCesium() {
            try {
                // Load Cesium widget CSS from CDN
                if (!document.getElementById("cesium-widgets-css")) {
                    const link = document.createElement("link");
                    link.id = "cesium-widgets-css";
                    link.rel = "stylesheet";
                    link.href = "https://unpkg.com/cesium@1.140.0/Build/Cesium/Widgets/widgets.css";
                    document.head.appendChild(link);
                }

                // Set base URL for Cesium assets (Workers, ThirdParty, Assets) to CDN
                (window as any).CESIUM_BASE_URL = "https://unpkg.com/cesium@1.140.0/Build/Cesium";

                const CesiumModule = await import("cesium");
                Cesium = CesiumModule;

                // Set Ion token
                Cesium.Ion.defaultAccessToken =
                    process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

                if (!containerRef.current || !mounted) return;

                const viewer = new Cesium.Viewer(containerRef.current, {
                    terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
                    baseLayerPicker: false,
                    geocoder: false,
                    homeButton: false,
                    sceneModePicker: true,
                    navigationHelpButton: false,
                    animation: false,
                    timeline: false,
                    fullscreenButton: false,
                    vrButton: false,
                    infoBox: true,
                    selectionIndicator: true,
                    shadows: false,
                    shouldAnimate: false,
                    // Use Bing Maps Aerial with Labels from Ion
                    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
                        Cesium.IonImageryProvider.fromAssetId(3)
                    ),
                });

                // Improve quality
                viewer.scene.globe.enableLighting = false;
                viewer.scene.fog.enabled = true;
                viewer.scene.postProcessStages.fxaa.enabled = true;

                viewerRef.current = viewer;

                // Fly to default center
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        defaultCenter.lng,
                        defaultCenter.lat,
                        15000
                    ),
                    duration: 2,
                });

                // Add item markers
                addItemMarkers(viewer, items);

                // Request user location
                requestLocation(viewer);

                setReady(true);
            } catch (err: any) {
                console.error("Cesium init error:", err);
                if (mounted) setError(err.message || "Failed to load Cesium");
            }
        }

        initCesium();

        return () => {
            mounted = false;
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []);

    // Update markers when items change
    useEffect(() => {
        if (viewerRef.current && ready && items.length > 0) {
            addItemMarkers(viewerRef.current, items);
        }
    }, [items, ready]);

    function addItemMarkers(viewer: any, itemList: Item[]) {
        // Remove previous item entities
        const toRemove = viewer.entities.values.filter(
            (e: any) => e._itemMarker === true
        );
        toRemove.forEach((e: any) => viewer.entities.remove(e));

        itemList.forEach((item) => {
            if (!item.latitude || !item.longitude) return;

            const entity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
                point: {
                    pixelSize: 14,
                    color: Cesium.Color.fromCssColorString("#ef4444"),
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                label: {
                    text: item.title,
                    font: "13px sans-serif",
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.BLACK,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    showBackground: true,
                    backgroundColor: Cesium.Color.fromCssColorString("rgba(0,0,0,0.6)"),
                    backgroundPadding: new Cesium.Cartesian2(6, 4),
                },
                description: `
          <div style="font-family:system-ui,sans-serif;padding:8px;">
            <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;">${item.title}</h3>
            <p style="margin:0 0 4px;font-size:12px;color:#aaa;">${item.condition || "Good"} · by ${item.ownerName || "User"}</p>
            <p style="margin:0 0 8px;font-size:12px;color:#888;">${item.category || ""}</p>
            <a href="/item/${item.id}" style="display:inline-block;padding:6px 16px;background:#7c3aed;color:white;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;">View Details →</a>
          </div>
        `,
            });
            (entity as any)._itemMarker = true;
        });
    }

    function requestLocation(viewer?: any) {
        if (!navigator.geolocation) return;
        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserPosition(loc);
                setLocating(false);

                const v = viewer || viewerRef.current;
                if (!v || !Cesium) return;

                // Add user location marker
                const existingUser = v.entities.values.find(
                    (e: any) => e._userLocation === true
                );
                if (existingUser) v.entities.remove(existingUser);

                const userEntity = v.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat),
                    point: {
                        pixelSize: 18,
                        color: Cesium.Color.fromCssColorString("#4285F4"),
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 3,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                    label: {
                        text: "📍 You are here",
                        font: "bold 14px sans-serif",
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        outlineColor: Cesium.Color.BLACK,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -24),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        showBackground: true,
                        backgroundColor: Cesium.Color.fromCssColorString(
                            "rgba(66,133,244,0.8)"
                        ),
                        backgroundPadding: new Cesium.Cartesian2(8, 5),
                    },
                    ellipse: {
                        semiMajorAxis: 200,
                        semiMinorAxis: 200,
                        material: Cesium.Color.fromCssColorString(
                            "rgba(66,133,244,0.12)"
                        ),
                        outline: true,
                        outlineColor: Cesium.Color.fromCssColorString(
                            "rgba(66,133,244,0.4)"
                        ),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    },
                });
                (userEntity as any)._userLocation = true;

                // Fly to user location
                v.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 12000),
                    duration: 2,
                });
            },
            () => {
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    function flyToUser() {
        if (userPosition && viewerRef.current && Cesium) {
            viewerRef.current.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    userPosition.lng,
                    userPosition.lat,
                    8000
                ),
                duration: 1.5,
            });
        } else {
            requestLocation();
        }
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/50 p-8">
                <div className="text-center max-w-md">
                    <p className="text-red-400 text-sm font-medium mb-2">⚠️ Map Error</p>
                    <p className="text-muted-foreground text-xs">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" />

            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground text-sm font-medium">Loading 3D Globe...</p>
                    </div>
                </div>
            )}

            {/* Locate Me Button */}
            <button
                onClick={flyToUser}
                disabled={locating}
                style={{
                    position: "absolute",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "rgba(30,30,40,0.9)",
                    color: "white",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    cursor: locating ? "wait" : "pointer",
                    fontWeight: 600,
                    fontSize: "13px",
                    backdropFilter: "blur(8px)",
                }}
            >
                {locating ? (
                    <>⏳ Locating...</>
                ) : (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        </svg>
                        My Location
                    </>
                )}
            </button>
        </div>
    );
}
