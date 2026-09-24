"use client";

import dynamic from "next/dynamic";

export type MapCoordinates = { latitude: number; longitude: number };

const TankulanMap = dynamic(
  () => import("@/components/tankulan-map").then((module) => module.TankulanMap),
  {
    ssr: false,
    loading: () => <div className="map-loading" role="status">Loading the Tankulan map…</div>,
  },
);

export function LocationPicker({ value, onChange }: { value?: MapCoordinates; onChange: (coordinates: MapCoordinates) => void }) {
  return <TankulanMap value={value} onChange={onChange} />;
}
