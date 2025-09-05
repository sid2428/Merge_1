"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import dynamic from "next/dynamic";
import { X, ArrowLeft } from "lucide-react";

// Plotly dynamic import to avoid SSR problems.
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/**
 * Single-file Insights module
 * - Index grid of insight cards (Indian Ocean focused)
 * - Client-side dedicated "pages" for each insight (detail view)
 * - Mock data + mock traces for all visuals
 *
 * Drop into: project/src/components/tabs/insights.tsx
 * Requirements: react-plotly.js, plotly.js-basic-dist, lucide-react, tailwindcss
 *
 * Designer/dev notes:
 * - Replace mockTraces() with real-data adapters that return Plotly traces.
 * - This file intentionally keeps components close so it's simple to copy-paste.
 */

/* ===========================
   Mock INSIGHTS dataset
   Each insight contains metadata and a mockTraces() function that returns:
     { left: PlotlyTrace[], right: PlotlyTrace[] }
   Replace mockTraces with real data function when ready.
   =========================== */
const INSIGHTS = [
  {
    id: "hidden-heatwaves",
    title: "Hidden Subsurface Heatwaves",
    subtitle: "Detecting thermal anomalies at 50–150 m that satellites miss",
    focusRegion: "Indian Ocean (Bay of Bengal & Arabian Sea)",
    lead:
      "ARGO vertical profiles reveal concentrated subsurface heat events in the Indian Ocean warm pool and western boundary currents.",
    color: "from-red-500 to-orange-500",
    mockTraces: () => {
      // Map hotspots and depth-time heatmap (mock)
      const left = [
        {
          type: "scattergeo",
          lon: [67, 72, 80, 92],
          lat: [15, 10, 5, -5],
          mode: "markers",
          marker: { size: [10, 12, 8, 9], color: [2, 3, 1, 2], colorscale: "YlOrRd" },
          name: "hotspots",
        },
      ];
      const right = [
        {
          z: Array.from({ length: 12 }, (_, i) =>
            Array.from({ length: 12 }, (_, j) => Math.round((Math.sin(i / 3) + Math.cos(j / 4)) * 30) / 100)
          ),
          x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          y: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
          type: "heatmap",
          colorscale: "YlOrRd",
          reversescale: true,
          colorbar: { title: "°C anomaly" },
          name: "Depth–time anomaly",
        },
      ];
      return { left, right };
    },
    how: [
      "Build monthly climatology per 1° grid & 10 m depth bins using ARGO profiles.",
      "Flag cells where temperature anomaly > 90th percentile for ≥5 contiguous days at 50–150 m.",
      "Summarize event counts, duration and maximum anomaly per grid cell.",
    ],
  },
  {
    id: "thermocline-tilt",
    title: "Thermocline Tilt — ENSO Early Signal",
    subtitle: "Z20 tilt index across the equatorial band",
    focusRegion: "Equatorial Pacific (method applies globally; Indian Ocean focus for demo)",
    lead:
      "Interpolate T(z) to find Z20 (depth of 20°C). The east-west tilt of Z20 gives lead signals for ENSO; we show the index and cross-section.",
    color: "from-indigo-500 to-blue-500",
    mockTraces: () => {
      const lon = Array.from({ length: 21 }, (_, i) => -160 + i * 8);
      const left = [{ x: lon, y: lon.map((_, i) => 100 + 40 * Math.sin(i / 6)), type: "scatter", mode: "lines+markers", name: "Z20" }];
      const right = [
        {
          x: Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
          y: Array.from({ length: 24 }, (_, i) => 10 + 20 * Math.sin(i / 6)),
          type: "scatter",
          mode: "lines+markers",
          name: "Tilt Index",
        },
      ];
      return { left, right };
    },
    how: [
      "Interpolate each temperature profile to find Z20 (depth where T = 20 °C).",
      "Average Z20 in west/east longitude bands (5°S–5°N).",
      "Tilt Index = Z20_west − Z20_east; analyze lead time vs ENSO indices.",
    ],
  },
  {
    id: "dead-zones",
    title: "Expanding Oxygen Minimum Zones",
    subtitle: "Tracking OMZ area and core shoaling over time",
    focusRegion: "Arabian Sea & Bay of Bengal",
    lead:
      "BGC ARGO profiles show OMZ expansion and shoaling in the northern Indian Ocean. We visualize spatial extent and time-series area growth.",
    color: "from-emerald-500 to-teal-500",
    mockTraces: () => {
      const years = Array.from({ length: 11 }, (_, i) => 2010 + i);
      const left = [{ type: "choropleth", locations: ["IND", "PAK", "BGD"], z: [12, 9, 15], text: ["Arabian Sea", "Pakistan Shelf", "Bay of Bengal"], colorscale: "Purples" }];
      const right = [{ x: years, y: years.map((y, i) => 1000 + i * 80 + Math.round(Math.random() * 30)), type: "bar" }];
      return { left, right };
    },
    how: [
      "Interpolate dissolved O₂ to standard depth bins; identify layers where O₂ < 60 μmol/kg.",
      "Compute areal extent for depth range 100–1000 m by grid cell area where condition holds.",
      "Track core depth and area annually to identify trends.",
    ],
  },
  {
    id: "cyclone-fingerprints",
    title: "Cyclone Fingerprints in the Ocean",
    subtitle: "Short-term cooling & mixing caused by tropical cyclones",
    focusRegion: "Bay of Bengal",
    lead:
      "By collocating ARGO profiles with cyclone tracks we detect rapid surface cooling (~3°C) and mixed-layer deepening. This demonstrates event-driven ocean response.",
    color: "from-yellow-400 to-orange-500",
    mockTraces: () => {
      const depths = Array.from({ length: 40 }, (_, i) => i * 2);
      const before = depths.map((d) => 28 - d * 0.02 + Math.random() * 0.05);
      const after = depths.map((d, i) => before[i] - (d < 40 ? 2.5 : 0.4) + Math.random() * 0.05);
      const left = [{ x: before, y: depths, type: "scatter", mode: "lines", name: "Before" }, { x: after, y: depths, type: "scatter", mode: "lines", name: "After" }];
      const right = [{ type: "scattergeo", lon: [90, 92, 94], lat: [10, 12, 14], mode: "lines+markers", name: "Cyclone track" }];
      return { left, right };
    },
    how: [
      "Match float profiles to cyclone best-track (within 200 km and ±7 days).",
      "Compute ΔT in 0–50 m and changes in mixed-layer depth for matched before/after pairs.",
      "Aggregate by cyclone category and basin to produce statistical summaries.",
    ],
  },
  {
    id: "ocean-heat-storage",
    title: "Ocean Heat Storage (0–2000 m)",
    subtitle: "Quantifying heat content rise in the Indian Ocean and globally",
    focusRegion: "Indian Ocean & global",
    lead:
      "Integrated OHC from ARGO profiles demonstrates sustained heat uptake concentrated in upper layers. We show time-series and India Ocean share.",
    color: "from-indigo-500 to-pink-500",
    mockTraces: () => {
      const years = Array.from({ length: 18 }, (_, i) => 2005 + i);
      const left = [{ x: years, y: years.map((y, i) => 1e8 + i * 3e7 + Math.sin(i / 2) * 5e6), type: "scatter", mode: "lines+markers", name: "Global OHC" }];
      const right = [{ labels: ["Indian Ocean", "Pacific", "Atlantic"], values: [35, 45, 20], type: "pie" }];
      return { left, right };
    },
    how: [
      "Compute column OHC per profile: sum(ρ·cp·(T−Tref)·Δz) for 0–2000 m.",
      "Grid and average per basin and compute anomalies vs baseline (e.g. 2005–2014).",
      "Report time-series, regional shares, and uncertainties via bootstrap.",
    ],
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
      "Aggregate transition probabilities and median travel times to build a connectivity matrix.",
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
    <article className="p-5 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-primary transition-all duration-300 shadow-md dark:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/30 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-md bg-gradient-to-br ${insight.color} text-white shadow-lg`} aria-hidden>
            {/* simple icon placeholder */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white">{insight.title}</h3>
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
            className={`px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r ${insight.color} shadow-lg hover:scale-105 transition-transform duration-300`}
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
          <h2 className="text-xl font-bold text-foreground dark:text-white">{title}</h2>
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
        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 shadow-md dark:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground dark:text-white">Primary visual</h4>
            <div className="flex items-center gap-2">
              <button onClick={() => exportPNG(plotLeftId, `${insight.id}-left.png`)} className="text-xs px-3 py-1 border rounded bg-muted hover:bg-muted/70 transition">
                Download PNG
              </button>
            </div>
          </div>
          <div id={plotLeftId} className="h-72">
            <Plot data={left} layout={layoutBase(insight.subtitle)} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">{insight.subtitle}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 shadow-md dark:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground dark:text-white">Secondary visual</h4>
            <div className="flex items-center gap-2">
              <button onClick={() => exportPNG(plotRightId, `${insight.id}-right.png`)} className="text-xs px-3 py-1 border rounded bg-muted hover:bg-muted/70 transition">
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

      <section className="mt-6 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 shadow-md dark:shadow-xl">
        <h4 className="font-semibold text-foreground dark:text-white">How this was calculated</h4>
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
export default function InsightsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // ensure body scroll available when leaving detail view
    return () => {
      if (typeof window !== "undefined") document.body.style.overflow = "";
    };
  }, []);

  const openInsight = (id: string) => {
    setSelectedId(id);
    // optional: lock background scroll
    if (typeof window !== "undefined") document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeInsight = () => {
    setSelectedId(null);
    if (typeof window !== "undefined") document.body.style.overflow = "";
  };

  // index view
  if (!selectedId) {
    return (
      <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-500 rounded-xl shadow-lg">
        <header className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white">Insights — Indian Ocean Focus</h1>
          <p className="text-muted-foreground mt-2">
            A curated set of professional insights derived from ARGO floats. Click any card to open a dedicated insight page with mock visualizations for frontend implementation.
          </p>
        </header>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INSIGHTS.map((ins) => (
            <InsightCard key={ins.id} insight={ins} onOpen={openInsight} />
          ))}
        </section>

        <footer className="max-w-6xl mx-auto mt-12 text-sm text-muted-foreground">
          <div>Mock data only — replace <code>insight.mockTraces()</code> with your data adapter.</div>
        </footer>
      </main>
    );
  }

  // detail view for selected insight
  const insight = INSIGHTS.find((i) => i.id === selectedId);
  if (!insight) return null;

  return (
    <main className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-500 rounded-xl shadow-lg">
      <div className="max-w-6xl mx-auto">
        <DetailView insight={insight} onBack={closeInsight} />
      </div>
    </main>
  );
}