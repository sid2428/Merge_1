import React from "react";


export default function HiddenHeatwaves({ onBack }: { onBack: () => void }) {
const left = [
{ type: "scattergeo", lon: [67, 72, 80, 92], lat: [15, 10, 5, -5], mode: "markers", marker: { size: [10, 12, 8, 9], color: [2,3,1,2], colorscale: "YlOrRd" }, name: "hotspots" }
];
const right = [
{ z: Array.from({length:12}, (_,i)=>Array.from({length:12}, (_,j)=>Math.round((Math.sin(i/3)+Math.cos(j/4))*30)/100)), x: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], y: [50,60,70,80,90,100,110,120,130,140,150,160], type: 'heatmap', colorscale: 'YlOrRd', reversescale: true }
];
const how = [
'Build monthly climatology per 1° grid & 10 m depth bins using ARGO profiles.',
'Flag cells where temperature anomaly > 90th percentile for ≥5 contiguous days at 50–150 m.',
'Summarize event counts, duration and maximum anomaly per grid cell.'
];


return (
<InsightLayout
title="Hidden Subsurface Heatwaves"
region="Indian Ocean (Bay of Bengal & Arabian Sea)"
subtitle="Detecting thermal anomalies at 50–150 m that satellites miss"
onBack={onBack}
>
<DetailShell id="hidden-heatwaves" subtitle="Depth–time anomaly (50–150 m)" left={left} right={right} how={how} />
</InsightLayout>
);
}