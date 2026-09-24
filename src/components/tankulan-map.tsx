"use client";

import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapCoordinates } from "@/components/location-picker";

const tankulanCenter: LatLngExpression = [8.36002, 124.86545];

function MapSelection({ value, onChange }: { value?: MapCoordinates; onChange: (coordinates: MapCoordinates) => void }) {
  const map = useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  useEffect(() => {
    if (value) map.panTo([value.latitude, value.longitude]);
  }, [map, value]);

  return value ? <CircleMarker center={[value.latitude, value.longitude]} radius={10} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#187f7a", fillOpacity: 1 }} /> : null;
}

export function TankulanMap({ value, onChange }: { value?: MapCoordinates; onChange: (coordinates: MapCoordinates) => void }) {
  const [ready, setReady] = useState(false);
  const [tileError, setTileError] = useState(false);

  return (
    <div className="location-map-wrap">
      <div className="location-map-head">
        <div>
          <strong>Select the concern location</strong>
          <span>Satellite view centered on Kihare, Tankulan. Tap or click to move the marker.</span>
        </div>
        {value && <output className="coordinate-chip">{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</output>}
      </div>
      <div className="location-map" aria-label="Interactive satellite map of Kihare, Tankulan">
        <MapContainer center={tankulanCenter} zoom={16} scrollWheelZoom className="leaflet-map" whenReady={() => setReady(true)}>
          <TileLayer
            attribution='Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            eventHandlers={{ tileerror: () => setTileError(true) }}
          />
          <MapSelection value={value} onChange={onChange} />
        </MapContainer>
        {!ready && <div className="map-loading" role="status">Loading satellite imagery…</div>}
      </div>
      {tileError && <p className="map-help" role="status">Satellite tiles could not load. Check your connection, then use your current location or enter a nearby landmark.</p>}
      {!value && <p className="map-help">No pin selected yet. You can still submit a nearby landmark, but a selected pin helps the team find the concern faster.</p>}
    </div>
  );
}
