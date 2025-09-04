import React from "react";
import InsightLayout from "@/components/insights/InsightLayout";
import DetailShell from "@/components/insights/DetailShell";


export default function OceanConnectivity({ onBack }: { onBack: () => void }) {
const left = [{ type: 'scattergeo', lon: [90,80,65,55], lat: [12,10,5,0], mode: 'lines', line: { width: 2, color: 'royalblue' }, name: 'Pathways' }];
const right = [{ type: 'sankey', orientation: 'h', node: { label: ['Bay of Bengal','Arabian Sea','Somali Current'] }, link: { source: [0,0,1], target: [1,2,2], value: [40,20,30] } }];
const how = [
'Tag each profile position with basin polygons and detect transitions between basins.',
'Aggregate transition probabilities and median travel times to build a connectivity matrix.',
'Visualize high-occupancy pathways using KDE and render Sankey for quick interpretation.'
];


return (
<InsightLayout
title="Basin Connectivity & Ocean Highways"
region="Indian Ocean corridors (BoB → AS → SoM)"
subtitle="Where floats travel — travel times and pathway density"
onBack={onBack}
>
<DetailShell id="ocean-connectivity" subtitle="Connectivity & pathways" left={left} right={right} how={how} />
</InsightLayout>
);
}