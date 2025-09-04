import React from "react";
import InsightLayout from "@/components/insights/InsightLayout";
import DetailShell from "@/components/insights/DetailShell";


export default function OceanHeatStorage({ onBack }: { onBack: () => void }) {
const years = Array.from({ length: 18 }, (_, i) => 2005 + i);
const left = [{ x: years, y: years.map((y, i) => 1e8 + i * 3e7 + Math.sin(i / 2) * 5e6), type: 'scatter', mode: 'lines+markers', name: 'Global OHC' }];
const right = [{ labels: ['Indian Ocean','Pacific','Atlantic'], values: [35,45,20], type: 'pie' }];
const how = [
'Compute column OHC per profile: sum(ρ·cp·(T−Tref)·Δz) for 0–2000 m.',
'Grid and average per basin and compute anomalies vs baseline (e.g. 2005–2014).',
'Report time-series, regional shares, and uncertainties via bootstrap.'
];


return (
<InsightLayout
title="Ocean Heat Storage (0–2000 m)"
region="Indian Ocean & global"
subtitle="Quantifying heat content rise in the Indian Ocean and globally"
onBack={onBack}
>
<DetailShell id="ocean-heat-storage" subtitle="OHC anomaly (time-series)" left={left} right={right} how={how} />
</InsightLayout>
);
}