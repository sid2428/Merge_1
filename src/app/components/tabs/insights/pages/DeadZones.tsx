"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function DeadZones({ onBack }: { onBack?: () => void }) {
  const years = Array.from({ length: 11 }, (_, i) => 2010 + i);
  const left = [{ type: "choropleth", locations: ["IND","PAK","BGD"], z: [12,9,15], text: ["Arabian Sea","Pakistan Shelf","Bay of Bengal"], colorscale: "Purples" }];
  const right = [{ x: years, y: years.map((y,i)=> 1000 + i*80 + Math.round(Math.random()*30)), type: "bar" }];

  const how = [
    "Interpolate dissolved O₂ to standard depth bins; identify layers where O₂ < 60 μmol/kg.",
    "Compute areal extent for 100–1000 m by grid cell area where the condition holds.",
    "Track core depth and area annually to identify trends."
  ];

  const layoutBase = (title = "") => ({ title, paper_bgcolor: "transparent", plot_bgcolor: "transparent", font: { color: "#0f172a" }, margin: { t:30,b:36,l:48,r:20 } });

  const exportPNG = async (elId: string, filename = "deadzones.png") => {
    try {
      const el = document.getElementById(elId) as any;
      const Plotly = (window as any).Plotly;
      if (el && Plotly?.toImage) {
        const dataUrl = await Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a"); a.href = dataUrl; a.download = filename; a.click();
      } else {
        alert("Export not available in this environment.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err); alert("Export failed");
    }
  };

  return (
    <div className="min-h-[60vh]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 rounded hover:bg-muted" aria-label="Back"><ArrowLeft /></button>
        <div>
          <h2 className="text-xl font-bold">Expanding Oxygen Minimum Zones</h2>
          <div className="text-xs text-muted-foreground">Arabian Sea & Bay of Bengal — OMZ area & core depth trends</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">OMZ map</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("dz-left", "omz-map.png")}>Download PNG</button>
          </div>
          <div id="dz-left" className="h-72">
            <Plot data={left} layout={layoutBase("OMZ Map (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">OMZ area over time</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("dz-right", "omz-timeseries.png")}>Download PNG</button>
          </div>
          <div id="dz-right" className="h-72">
            <Plot data={right} layout={layoutBase("OMZ area (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-2 text-sm text-muted-foreground space-y-2">
          {how.map((s, idx) => <div key={idx} className="flex gap-2 items-start"><div className="text-xs text-slate-400 mt-1">•</div><div>{s}</div></div>)}
        </div>
      </section>
    </div>
  );
}
