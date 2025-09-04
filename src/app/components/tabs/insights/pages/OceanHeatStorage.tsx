"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function OceanHeatStorage({ onBack }: { onBack?: () => void }) {
  const years = Array.from({ length: 18 }, (_, i) => 2005 + i);
  const left = [{ x: years, y: years.map((y, i) => 1e8 + i * 3e7 + Math.sin(i / 2) * 5e6), type: "scatter", mode: "lines+markers", name: "Global OHC" }];
  const right = [{ labels: ["Indian Ocean", "Pacific", "Atlantic"], values: [35, 45, 20], type: "pie" }];

  const how = [
    "Compute column OHC per profile: sum(ρ·cp·(T−Tref)·Δz) for 0–2000 m.",
    "Grid and average per basin and compute anomalies vs baseline (e.g. 2005–2014).",
    "Report time-series, regional shares, and uncertainties via bootstrap.",
  ];

  const layoutBase = (title = "") => ({ title, paper_bgcolor: "transparent", plot_bgcolor: "transparent", font: { color: "#0f172a" }, margin: { t:30,b:36,l:48,r:20 } });

  const exportPNG = async (elId: string, filename = "ohc.png") => {
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
          <h2 className="text-xl font-bold">Ocean Heat Storage (0–2000 m)</h2>
          <div className="text-xs text-muted-foreground">Indian Ocean & global OHC trends (mock)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">OHC time-series</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("ohc-left", "ohc-timeseries.png")}>Download PNG</button>
          </div>
          <div id="ohc-left" className="h-72">
            <Plot data={left} layout={layoutBase("Global OHC (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Regional share</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("ohc-right", "ohc-share.png")}>Download PNG</button>
          </div>
          <div id="ohc-right" className="h-72">
            <Plot data={right} layout={layoutBase("Regional OHC share (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
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
