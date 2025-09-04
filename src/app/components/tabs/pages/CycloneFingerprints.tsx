import React from "react";
import InsightLayout from "@/components/insights/InsightLayout";
import DetailShell from "@/components/insights/DetailShell";


export default function CycloneFingerprints({ onBack }: { onBack: () => void }) {
const depths = Array.from({ length: 40 }, (_, i) => i * 2);
const before = depths.map((d) => 28 - d * 0.02 + Math.random() * 0.05);
const after = depths.map((d, i) => before[i] - (d < 40 ? 2.5 : 0.4) + Math.random() * 0.05);
const left = [
{ x: before, y: depths, type: 'scatter', mode: 'lines', name: 'Before' },
{ x: after, y: depths, type: 'scatter', mode: 'lines', name: 'After' },
];
const right = [{ type: 'scattergeo', lon: [90, 92, 94], lat: [10, 12, 14], mode: 'lines+markers', name: 'Cyclone track' }];
const how = [
'Match float profiles to cyclone best-track (within 200 km and ±7 days).',
'Compute ΔT in 0–50 m and changes in mixed-layer depth for matched pairs.',
'Aggregate by cyclone category and basin.'
];


return (
<InsightLayout
title="Cyclone Fingerprints in the Ocean"
region="Bay of Bengal"
subtitle="Short-term cooling & mixing caused by tropical cyclones"
onBack={onBack}
>
<DetailShell id="cyclone-fingerprints" subtitle="Before/After temperature profiles" left={left} right={right} how={how} />
</InsightLayout>
);
}