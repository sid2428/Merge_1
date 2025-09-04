"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function HiddenHeatwaves({ onBack }: { onBack?: () => void }) {
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
      x: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      y: [50,60,70,80,90,100,110,120,130,140,150,160],
      type: "heatmap",
      colorscale: "YlOrRd",
      reversescale: true,
      colorbar: { title: "°C anomaly" },
    },
  ];

  const how = [
    "Build monthly climatology per 1° grid & 10 m depth bins using ARGO profiles.",
    "Flag cells where temperature anomaly > 90th percentile for ≥5 contiguous days at 50–150 m.",
    "Summarize event counts, duration and maximum anomaly per grid cell.",
  ];

  const layoutBase = (title = "") => ({
    title,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#0f172a" },
    margin: { t: 30, b: 36, l: 48, r: 20 },
  });

  const exportPNG = async (elId: string, filename = "plot.png") => {
    try {
      const el = document.getElementById(elId) as any;
      const Plotly = (window as any).Plotly;
      if (el && Plotly?.toImage) {
        const dataUrl = await Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        a.click();
      } else {
        alert("Export not available in this environment.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Export failed (see console).");
    }
  };

  return (
    <div className="min-h-[60vh]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 rounded hover:bg-muted" aria-label="Back">
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-xl font-bold">Hidden Subsurface Heatwaves</h2>
          <div className="text-xs text-muted-foreground">Indian Ocean — subsurface (50–150 m) thermal anomalies</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Heatwave hotspots (map)</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("hh-left", "hidden-heatwaves-map.png")}>Download PNG</button>
          </div>
          <div id="hh-left" className="h-72">
            <Plot data={left} layout={layoutBase("Heatwave hotspots (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Depth–time anomaly</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("hh-right", "hidden-heatwaves-ribbon.png")}>Download PNG</button>
          </div>
          <div id="hh-right" className="h-72">
            <Plot data={right} layout={layoutBase("Depth–time anomaly (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-2 text-sm text-muted-foreground space-y-2">
          {how.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="text-xs text-slate-400 mt-1">•</div>
              <div>{s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
