"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function OceanConnectivity({ onBack }: { onBack?: () => void }) {
  const left = [{ type: "scattergeo", lon: [90, 80, 65, 55], lat: [12, 10, 5, 0], mode: "lines", line: { width: 2, color: "royalblue" }, name: "Pathways" }];
  const right = [
    {
      type: "sankey",
      orientation: "h",
      node: { label: ["Bay of Bengal", "Arabian Sea", "Somali Current"] },
      link: { source: [0, 0, 1], target: [1, 2, 2], value: [40, 20, 30] },
    },
  ];

  const how = [
    "Tag each profile position with basin polygons and detect transitions between basins.",
    "Aggregate transition probabilities and median travel times to build a connectivity matrix.",
    "Visualize high-occupancy pathways using KDE and render Sankey for quick interpretation.",
  ];

  const layoutBase = (title = "") => ({ title, paper_bgcolor: "transparent", plot_bgcolor: "transparent", font: { color: "#0f172a" }, margin: { t:30,b:36,l:48,r:20 } });

  const exportPNG = async (elId: string, filename = "connectivity.png") => {
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
          <h2 className="text-xl font-bold">Basin Connectivity & Ocean Highways</h2>
          <div className="text-xs text-muted-foreground">Indian Ocean corridors — path density & transition probabilities</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Path density (map)</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("oc-left", "paths.png")}>Download PNG</button>
          </div>
          <div id="oc-left" className="h-72">
            <Plot data={left} layout={layoutBase("Path density (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Connectivity Sankey</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("oc-right", "sankey.png")}>Download PNG</button>
          </div>
          <div id="oc-right" className="h-72">
            <Plot data={right} layout={layoutBase("Connectivity (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
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
