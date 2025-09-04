import React from "react";
import InsightLayout from "@/components/insights/InsightLayout";
import DetailShell from "@/components/insights/DetailShell";


export default function DeadZones({ onBack }: { onBack: () => void }) {
const years = Array.from({ length: 11 }, (_, i) => 2010 + i);
const left = [{ type: 'choropleth', locations: ['IND','PAK','BGD'], z: [12,9,15], text: ['Arabian Sea','Pakistan Shelf','Bay of Bengal'], colorscale: 'Purples' }];
const right = [{ x: years, y: years.map((y,i)=> 1000 + i*80 + Math.round(Math.random()*30)), type: 'bar' }];
const how = [
'Interpolate dissolved O₂ to standard depth bins; identify layers where O₂ < 60 μmol/kg.',
'Compute areal extent for 100–1000 m by grid cell area where the condition holds.',
'Track core depth and area annually to identify trends.'
];


return (
<InsightLayout
title="Expanding Oxygen Minimum Zones"
region="Arabian Sea & Bay of Bengal"
subtitle="Tracking OMZ area and core shoaling over time"
onBack={onBack}
>
<DetailShell id="dead-zones" subtitle="OMZ area time-series" left={left} right={right} how={how} />
</InsightLayout>
);
}