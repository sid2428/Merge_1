"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

// Per-insight pages (keep these files separate under src/components/insights/pages)
import HiddenHeatwaves from "@/components/insights/pages/HiddenHeatwaves";
import ThermoclineTilt from "@/components/insights/pages/ThermoclineTilt";
import DeadZones from "@/components/insights/pages/DeadZones";
import CycloneFingerprints from "@/components/insights/pages/CycloneFingerprints";
import OceanHeatStorage from "@/components/insights/pages/OceanHeatStorage";
import OceanConnectivity from "@/components/insights/pages/OceanConnectivity";


// Plotly dynamic import used by per-insight pages (they themselves import Plotly inside their modules)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/*
  Single-file shared layer for Insights
  - Exports default: InsightsIndex
  - Includes: registry (metadata -> component mapping), InsightCard, InsightLayout, DetailShell
  - Per-insight pages must exist in src/components/insights/pages/*.tsx
*/

// Registry maps metadata to components (the components are imported above)
const registry = [
  {
    id: "hidden-heatwaves",
    title: "Hidden Subsurface Heatwaves",
    subtitle: "Detecting thermal anomalies at 50–150 m that satellites miss",
    lead: "ARGO vertical profiles reveal concentrated subsurface heat events in the Indian Ocean warm pool and western boundary currents.",
    focusRegion: "Indian Ocean (Bay of Bengal & Arabian Sea)",
    color: "from-red-500 to-orange-500",
    component: HiddenHeatwaves,
  },
  {
    id: "thermocline-tilt",
    title: "Thermocline Tilt — ENSO Early Signal",
    subtitle: "Z20 tilt index across the equatorial band",
    lead: "Interpolate T(z) to find Z20 (depth of 20°C). East-west tilt provides lead signals for ENSO.",
    focusRegion: "Equatorial Pacific (method applies globally; Indian Ocean demo)",
    color: "from-indigo-500 to-blue-500",
    component: ThermoclineTilt,
  },
  {
    id: "dead-zones",
    title: "Expanding Oxygen Minimum Zones",
    subtitle: "Tracking OMZ area and core shoaling over time",
    lead: "BGC ARGO profiles show OMZ expansion and shoaling in the northern Indian Ocean.",
    focusRegion: "Arabian Sea & Bay of Bengal",
    color: "from-emerald-500 to-teal-500",
    component: DeadZones,
  },
  {
    id: "cyclone-fingerprints",
    title: "Cyclone Fingerprints in the Ocean",
    subtitle: "Short-term cooling & mixing caused by tropical cyclones",
    lead: "Collocating ARGO profiles with cyclone tracks shows rapid surface cooling and mixing.",
    focusRegion: "Bay of Bengal",
    color: "from-yellow-400 to-orange-500",
    component: CycloneFingerprints,
  },
  {
    id: "ocean-heat-storage",
    title: "Ocean Heat Storage (0–2000 m)",
    subtitle: "Quantifying heat content rise in the Indian Ocean and globally",
    lead: "Integrated OHC from ARGO profiles demonstrates sustained heat uptake.",
    focusRegion: "Indian Ocean & global",
    color: "from-indigo-500 to-pink-500",
    component: OceanHeatStorage,
  },
  {
    id: "ocean-connectivity",
    title: "Basin Connectivity & Ocean Highways",
    subtitle: "Where floats travel — travel times and pathway density",
    lead: "Lagrangian paths show preferred corridors and median travel times between basins.",
    focusRegion: "Indian Ocean corridors (BoB → AS → SoM)",
    color: "from-blue-400 to-cyan-500",
    component: OceanConnectivity,
  },
];

/* -------------------------
   Component: InsightCard
   ------------------------- */
function InsightCard({ insight, onOpen }: { insight: any; onOpen: (id: string) => void }) {
  return (
    <article className="p-5 rounded-xl bg-white dark:bg-slate-800 border hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-md bg-gradient-to-br ${insight.color} text-white`} aria-hidden>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{insight.title}</h3>
            <div className="text-xs text-muted-foreground mt-1">{insight.subtitle}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{insight.lead}</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Focus: {insight.focusRegion}</div>
        <button
          onClick={() => onOpen(insight.id)}
          className={`px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r ${insight.color} shadow hover:scale-105 transition-transform`}
          aria-label={`Open ${insight.title}`}
        >
          View Insight
        </button>
      </div>
    </article>
  );
}

/* -------------------------
   Component: InsightLayout
   ------------------------- */
function InsightLayout({ title, region, subtitle, children, onBack }: any) {
  return (
    <div className="min-h-[60vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-md hover:bg-muted transition" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="text-xs text-muted-foreground">Region: {region}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Mock visualization — replace with live data</div>
      </div>

      {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}

      <div>{children}</div>
    </div>
  );
}

/* -------------------------
   Component: DetailShell
   - Generic two-panel Plotly shell used by insight pages
   ------------------------- */
function DetailShell({ id, subtitle, left, right, how }: any) {
  const exportPNG = async (plotId: string, filename: string) => {
    try {
      const el = document.getElementById(plotId) as any;
      const Plotly = (window as any).Plotly;
      if (el && Plotly?.toImage) {
        const img = await Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a");
        a.href = img;
        a.download = filename;
        a.click();
      } else {
        alert("Export not available in this environment.");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Export failed");
    }
  };

  const layoutBase = (title: string) => ({
    title,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#0f172a" },
    margin: { t: 28, b: 36, l: 48, r: 20 },
    legend: { orientation: "h", y: -0.15 },
  });

  const leftId = `${id}-left`;
  const rightId = `${id}-right`;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Primary visual</h4>
            <button onClick={() => exportPNG(leftId, `${id}-left.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">Download PNG</button>
          </div>
          <div id={leftId} className="h-72">
            <Plot data={left} layout={layoutBase(subtitle || "Primary")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">{subtitle}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Secondary visual</h4>
            <button onClick={() => exportPNG(rightId, `${id}-right.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">Download PNG</button>
          </div>
          <div id={rightId} className="h-72">
            <Plot data={right} layout={layoutBase("Detail")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Details & context for visualization.</p>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-3 text-sm text-muted-foreground space-y-2">
          {how.map((line: string, idx: number) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="text-xs text-slate-400 mt-1">•</div>
              <div>{line}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* -------------------------
   Main export: InsightsIndex
   ------------------------- */
export default function InsightsIndex() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const open = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const close = () => {
    setSelectedId(null);
    if (typeof window !== "undefined") document.body.style.overflow = "";
  };

  if (!selectedId) {
    return (
      <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
        <header className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Insights — Indian Ocean Focus</h1>
          <p className="text-muted-foreground mt-2">A curated set of professional insights derived from ARGO floats. Click any card to open a dedicated insight page with mock visualizations for frontend implementation.</p>
        </header>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registry.map((ins) => (
            <InsightCard key={ins.id} insight={ins} onOpen={open} />
          ))}
        </section>

        <footer className="max-w-6xl mx-auto mt-12 text-sm text-muted-foreground">
          <div>Mock data only — replace the per-insight page mock traces with your data adapter.</div>
        </footer>
      </main>
    );
  }

  const entry = registry.find((r) => r.id === selectedId)!;
  const InsightComponent = entry.component;

  return (
    <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <InsightComponent onBack={close} />
      </div>
    </main>
  );
}
