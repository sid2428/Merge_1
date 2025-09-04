"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function CycloneFingerprints({ onBack }: { onBack?: () => void }) {
  const depths = Array.from({ length: 40 }, (_, i) => i * 2);
  const before = depths.map((d) => 28 - d * 0.02 + Math.random() * 0.05);
  const after = depths.map((d, i) => before[i] - (d < 40 ? 2.5 : 0.4) + Math.random() * 0.05);

  const left = [
    { x: before, y: depths, type: "scatter", mode: "lines", name: "Before" },
    { x: after, y: depths, type: "scatter", mode: "lines", name: "After" },
  ];
  const right = [{ type: "scattergeo", lon: [90, 92, 94], lat: [10, 12, 14], mode: "lines+markers", name: "Cyclone track" }];

  const how = [
    "Match float profiles to cyclone best-track (within 200 km and ±7 days).",
    "Compute ΔT in 0–50 m and changes in mixed-layer depth for matched before/after pairs.",
    "Aggregate by cyclone category and basin to produce statistical summaries.",
  ];

  const layoutBase = (title = "") => ({ title, paper_bgcolor: "transparent", plot_bgcolor: "transparent", font: { color: "#0f172a" }, margin: { t:30,b:36,l:48,r:20 } });

  const exportPNG = async (elId: string, filename = "cyclone.png") => {
    try {
      const el = document.getElementById(elId) as any;
      const Plotly = (window as any).Plotly;
      if (el && Plotly?.toImage) {
        const dataUrl = await Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a"); a.href = dataUrl; a.download = filename; a.click();
      } else alert("Export not available.");
    } catch (err) { console.error(err); alert("Export failed"); }
  };

  return (
    <div className="min-h-[60vh]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 rounded hover:bg-muted" aria-label="Back"><ArrowLeft /></button>
        <div>
          <h2 className="text-xl font-bold">Cyclone Fingerprints in the Ocean</h2>
          <div className="text-xs text-muted-foreground">Bay of Bengal — before/after profiles and track collocation</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Before / After temperature profiles</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("cf-left", "cyclone-profiles.png")}>Download PNG</button>
          </div>
          <div id="cf-left" className="h-72">
            <Plot data={left} layout={layoutBase("Before / After temperature (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Cyclone track</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("cf-right", "cyclone-track.png")}>Download PNG</button>
          </div>
          <div id="cf-right" className="h-72">
            <Plot data={right} layout={layoutBase("Cyclone track (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-2 text-sm text-muted-foreground space-y-2">{how.map((s,i)=>(<div key={i} className="flex gap-2 items-start"><div className="text-xs text-slate-400 mt-1">•</div><div>{s}</div></div>))}</div>
      </section>
    </div>
  );
}
