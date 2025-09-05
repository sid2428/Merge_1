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
    mockTraces: () => {
      const left = [{ type: "scattergeo", lon: [90, 80, 65, 55], lat: [12, 10, 5, 0], mode: "lines", line: { width: 2, color: "royalblue" } }];
      const right = [
        {
          type: "sankey",
          orientation: "h",
          node: { label: ["Bay of Bengal", "Arabian Sea", "Somali Current"] },
          link: { source: [0, 0, 1], target: [1, 2, 2], value: [40, 20, 30] },
        },
      ];
      return { left, right };
    },
    how: [
      "Tag each profile position with basin polygons; detect transitions between basins for floats.",
      "Aggregate transition probabilities and median travel times to build connectivity matrix.",
      "Visualize high-occupancy pathways using KDE and render Sankey for quick interpretation.",
    ],
  },
];

/* ===========================
   Small reusable components
   - InsightCard: tile used on the index page
   - BackBar: top bar on detail page
   - DetailView: per-insight page content (left/right plots + how)
   =========================== */

function InsightCard({ insight, onOpen }: { insight: any; onOpen: (id: string) => void }) {
  return (
    <article className="p-5 rounded-xl bg-white dark:bg-slate-800 border hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-md bg-gradient-to-br ${insight.color} text-white`} aria-hidden>
            {/* simple icon placeholder */}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpen(insight.id)}
            className={`px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r ${insight.color} shadow hover:scale-105 transition-transform`}
            aria-label={`Open ${insight.title}`}
          >
            View Insight
          </button>
        </div>
      </div>
    </article>
  );
}

function BackBar({ onBack, title, region }: { onBack: () => void; title: string; region: string }) {
  return (
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
  );
}

/* ===========================
   DetailView: shows left+right Plot panels + 'how' bullets
   - plotIdPrefix used to give stable DOM ids if you later want to export PNG via Plotly.
   =========================== */
function DetailView({
  insight,
  onBack,
}: {
  insight: any;
  onBack: () => void;
}) {
  const { left, right } = insight.mockTraces();
  const plotLeftId = `${insight.id}-left`;
  const plotRightId = `${insight.id}-right`;

  // simple export PNG using Plotly if Plotly loaded and element present
  const exportPNG = async (plotId: string, filename: string) => {
    try {
      // Plotly is available on window.Plotly if plotly.js bundle loaded
      // react-plotly attaches DOM node with id=plotId if provided to Plot.
      const el = document.getElementById(plotId);
      // safety: if not available, fallback to alert
      if (el && (window as any).Plotly && (window as any).Plotly.toImage) {
        const imgData = await (window as any).Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a");
        a.href = imgData;
        a.download = filename;
        a.click();
      } else {
        alert("Export not available in this environment. Use the mock export hook or wire Plotly.toImage.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Export failed", err);
      alert("Export failed (see console).");
    }
  };

  // basic layout props for Plotly traces
  const layoutBase = (title: string) => ({
    title,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#0f172a" },
    margin: { t: 28, b: 36, l: 48, r: 20 },
    legend: { orientation: "h", y: -0.15 },
  });

  return (
    <div className="min-h-[60vh]">
      <BackBar onBack={onBack} title={insight.title} region={insight.focusRegion} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Primary visual</h4>
            <div className="flex items-center gap-2">
              <button onClick={() => exportPNG(plotLeftId, `${insight.id}-left.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">
                Download PNG
              </button>
            </div>
          </div>
          <div id={plotLeftId} className="h-72">
            <Plot data={left} layout={layoutBase(insight.subtitle)} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">{insight.subtitle}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Secondary visual</h4>
            <div className="flex items-center gap-2">
              <button onClick={() => exportPNG(plotRightId, `${insight.id}-right.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">
                Download PNG
              </button>
            </div>
          </div>
          <div id={plotRightId} className="h-72">
            <Plot data={right} layout={layoutBase("Detail")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Details & context for visualization.</p>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-3 text-sm text-muted-foreground space-y-2">
          {insight.how.map((line: string, idx: number) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="text-xs text-slate-400 mt-1">•</div>
              <div>{line}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===========================
   Main component exported by file
   - Renders index grid or detail view based on selectedId state
   =========================== */
export default function InsightsPackedSingleFile() {
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
      <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-500 rounded-xl shadow-lg">
        <header className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white">Insights — Indian Ocean Focus</h1>
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
    <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <DetailView insight={insight} onBack={closeInsight} />
      </div>
    </main>
  );
}