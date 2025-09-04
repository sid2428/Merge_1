"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ThermoclineTilt({ onBack }: { onBack?: () => void }) {
  const lon = Array.from({ length: 21 }, (_, i) => -160 + i * 8);
  const left = [{ x: lon, y: lon.map((_, i) => 100 + 40 * Math.sin(i / 6)), type: "scatter", mode: "lines+markers", name: "Z20" }];
  const right = [{ x: Array.from({ length: 24 }, (_, i) => `M${i + 1}`), y: Array.from({ length: 24 }, (_, i) => 10 + 20 * Math.sin(i / 6)), type: "scatter", mode: "lines+markers", name: "Tilt Index" }];

  const how = [
    "Interpolate each profile to find Z20 (depth where T = 20°C).",
    "Average Z20 in predefined west/east longitude bands (5°S–5°N).",
    "Tilt Index = Z20_west − Z20_east; analyze lead time vs ENSO indices.",
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
        <button onClick={onBack} className="p-2 rounded hover:bg-muted" aria-label="Back"><ArrowLeft /></button>
        <div>
          <h2 className="text-xl font-bold">Thermocline Tilt — ENSO Early Signal</h2>
          <div className="text-xs text-muted-foreground">Equatorial band Z20 tilt index (demo)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Equatorial Z20 cross-section</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("tt-left", "thermocline-cross.png")}>Download PNG</button>
          </div>
          <div id="tt-left" className="h-72">
            <Plot data={left} layout={layoutBase("Z20 cross-section (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Tilt Index</h4>
            <button className="text-xs px-3 py-1 border rounded" onClick={() => exportPNG("tt-right", "thermocline-tilt.png")}>Download PNG</button>
          </div>
          <div id="tt-right" className="h-72">
            <Plot data={right} layout={layoutBase("Tilt Index (mock)")} useResizeHandler style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <section className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
        <h4 className="font-semibold">How this was calculated</h4>
        <div className="mt-2 text-sm text-muted-foreground space-y-2">
          {how.map((s, i) => (
            <div key={i} className="flex gap-2 items-start"><div className="text-xs text-slate-400 mt-1">•</div><div>{s}</div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
