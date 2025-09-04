import React from "react";
import InsightLayout from "@/components/insights/InsightLayout";
import DetailShell from "@/components/insights/DetailShell";


export default function ThermoclineTilt({ onBack }: { onBack: () => void }) {
const lon = Array.from({ length: 21 }, (_, i) => -160 + i * 8);
const left = [{ x: lon, y: lon.map((_, i) => 100 + 40 * Math.sin(i / 6)), type: 'scatter', mode: 'lines+markers', name: 'Z20' }];
const right = [{ x: Array.from({ length: 24 }, (_, i) => `M${i + 1}`), y: Array.from({ length: 24 }, (_, i) => 10 + 20 * Math.sin(i / 6)), type: 'scatter', mode: 'lines+markers', name: 'Tilt Index' }];
const how = [
'Interpolate each temperature profile to find Z20 (depth where T = 20 °C).',
'Average Z20 in west/east longitude bands (5°S–5°N).',
'Tilt Index = Z20_west − Z20_east; analyze lead time vs ENSO indices.'
];


return (
<InsightLayout
title="Thermocline Tilt — ENSO Early Signal"
region="Equatorial Pacific (method applies globally; Indian Ocean demo)"
subtitle="Z20 tilt index across the equatorial band"
onBack={onBack}
>
<DetailShell id="thermocline-tilt" subtitle="Equatorial Z20 cross-section" left={left} right={right} how={how} />
</InsightLayout>
);
}