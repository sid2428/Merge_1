"use client";

import React, { useState, useEffect } from "react";
import InsightCard from "./InsightCard";
import HiddenHeatwaves from "./insights/pages/HiddenHeatwaves";
// Note: Other detail pages would be imported here as well
// import ThermoclineTilt from "./insights/pages/ThermoclineTilt"; 
// etc.


/* Removed the large INSIGHTS data object and internal DetailView component from here.
  This component now focuses on orchestrating the view (list vs detail)
  and passes control to specific insight page components.
*/

const INSIGHTS_METADATA = [
  {
    id: "hidden-heatwaves",
    title: "Hidden Subsurface Heatwaves",
    subtitle: "Detecting thermal anomalies at 50–150 m that satellites miss",
    focusRegion: "Indian Ocean (Bay of Bengal & Arabian Sea)",
    lead:
      "ARGO vertical profiles reveal concentrated subsurface heat events in the Indian Ocean warm pool and western boundary currents.",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "thermocline-tilt",
    title: "Thermocline Tilt — ENSO Early Signal",
    subtitle: "Z20 tilt index across the equatorial band",
    focusRegion: "Equatorial Pacific (method applies globally; Indian Ocean focus for demo)",
    lead:
      "Interpolate T(z) to find Z20 (depth of 20°C). The east-west tilt of Z20 gives lead signals for ENSO; we show the index and cross-section.",
    color: "from-indigo-500 to-blue-500",
  },
    {
    id: "dead-zones",
    title: "Expanding Oxygen Minimum Zones",
    subtitle: "Tracking OMZ area and core shoaling over time",
    focusRegion: "Arabian Sea & Bay of Bengal",
    lead:
      "BGC ARGO profiles show OMZ expansion and shoaling in the northern Indian Ocean. We visualize spatial extent and time-series area growth.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "cyclone-fingerprints",
    title: "Cyclone Fingerprints in the Ocean",
    subtitle: "Short-term cooling & mixing caused by tropical cyclones",
    focusRegion: "Bay of Bengal",
    lead:
      "By collocating ARGO profiles with cyclone tracks we detect rapid surface cooling (~3°C) and mixed-layer deepening. This demonstrates event-driven ocean response.",
    color: "from-yellow-400 to-orange-500",
  },
   {
    id: "ocean-heat-storage",
    title: "Ocean Heat Storage (0–2000 m)",
    subtitle: "Quantifying heat content rise in the Indian Ocean and globally",
    focusRegion: "Indian Ocean & global",
    lead:
      "Integrated OHC from ARGO profiles demonstrates sustained heat uptake concentrated in upper layers. We show time-series and India Ocean share.",
    color: "from-indigo-500 to-pink-500",
  },
  {
    id: "ocean-connectivity",
    title: "Basin Connectivity & Ocean Highways",
    subtitle: "Where floats travel — travel times and pathway density",
    focusRegion: "Indian Ocean corridors (BoB → AS → SoM)",
    lead:
      "Lagrangian ARGO paths show preferred corridors and median travel times between key Indian Ocean basins. We visualize paths and compute transition probabilities.",
    color: "from-blue-400 to-cyan-500",
  },
];


export default function InsightsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") document.body.style.overflow = "";
    };
  }, []);

  const openInsight = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeInsight = () => {
    setSelectedId(null);
    if (typeof window !== "undefined") document.body.style.overflow = "";
  };
  
  // RENDER LOGIC
  if (!selectedId) {
    // Index Grid View
    return (
      <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
        <header className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Insights — Indian Ocean Focus</h1>
          <p className="text-muted-foreground mt-2">
            A curated set of professional insights derived from ARGO floats. Click any card to open a dedicated insight page.
          </p>
        </header>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INSIGHTS_METADATA.map((ins) => (
            <InsightCard key={ins.id} insight={ins} onOpen={openInsight} />
          ))}
        </section>
      </main>
    );
  }

  // Detail View
  // Here we can select which component to render based on the ID
  const renderDetailView = () => {
    switch(selectedId) {
      case 'hidden-heatwaves':
        return <HiddenHeatwaves onBack={closeInsight} />;
      // ... cases for other insights would go here
      // case 'thermocline-tilt':
      //   return <ThermoclineTilt onBack={closeInsight} />;
      default:
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold">Insight component not found</h2>
                <p className="text-muted-foreground mt-2">The detail view for "{selectedId}" has not been implemented yet.</p>
                <button onClick={closeInsight} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">Back to Insights</button>
            </div>
        );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {renderDetailView()}
      </div>
    </main>
  );
}
