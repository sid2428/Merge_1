"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
// FIXED: Added Download and Printer to the import statement
import { Download, Printer } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/* Types */
type FloatSeries = {
  id: string;
  temps: number[]; // temperatures corresponding to depths[]
  color?: string;
  emoji?: string;
};

type Props = {
  theme?: "light" | "dark";
  floats?: FloatSeries[]; // optional override
  depths?: number[];
};

/* Component */
export default function CompareTab({ theme = "light", floats: floatsProp, depths: depthsProp }: Props) {
  // ---------- depth bins ----------
  const defaultDepths = [0, 50, 100, 200, 400, 600, 800, 1000];

  // ---------- sample datasets per ocean (replace with real data later) ----------
  const oceanPresets: Record<string, FloatSeries[]> = {
    Atlantic: [
      { id: "AT-98765 (Warm Core)", temps: [26, 24, 21, 16, 11, 8, 6, 5], color: "#ff7a3d", emoji: "🔥" },
      { id: "AT-12345 (Cold Front)", temps: [19, 18, 16, 14, 11, 8, 6, 5], color: "#2b90ff", emoji: "❄️" },
      { id: "AT-54321 (Standard)", temps: [22, 21, 19, 15, 12, 9, 7, 6], color: "#16a34a", emoji: "🌊" }
    ],
    Pacific: [
      { id: "PX-10234 (Warm Core)", temps: [27, 25, 22, 17, 12, 9, 7, 6], color: "#ff5c33", emoji: "🔥" },
      { id: "PX-20456 (Upwelling)", temps: [16, 15, 14, 12, 10, 8, 6, 5], color: "#1e90ff", emoji: "❄️" },
      { id: "PX-30987 (Typical)", temps: [21, 19, 17, 14, 11, 9, 7, 6], color: "#10b981", emoji: "🌊" }
    ],
    Indian: [
      { id: "IN-55678 (Warm)", temps: [28, 26, 23, 18, 13, 10, 8, 7], color: "#ff8a3d", emoji: "🔥" },
      { id: "IN-66778 (Cool Patch)", temps: [18, 17, 15, 13, 11, 9, 7, 6], color: "#3b82f6", emoji: "❄️" },
      { id: "IN-77889 (Baseline)", temps: [23, 21, 19, 15, 12, 10, 8, 7], color: "#22c55e", emoji: "🌊" }
    ],
    Southern: [
      { id: "SO-00123 (Cold Core)", temps: [10, 9, 8, 7, 6, 5, 4, 3], color: "#2b6eff", emoji: "❄️" },
      { id: "SO-00987 (Mixed)", temps: [14, 13, 12, 10, 9, 8, 6, 5], color: "#57cc99", emoji: "🌊" }
    ],
    Arctic: [
      { id: "AR-90001 (Cold Surface)", temps: [4, 3.8, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5], color: "#1f78ff", emoji: "❄️" },
      { id: "AR-90002 (Standard)", temps: [5, 4.6, 4.2, 3.9, 3.6, 3.4, 3.1, 3.0], color: "#2dd4bf", emoji: "🌊" }
    ]
  };

  const depths = depthsProp ?? defaultDepths;

  // ---------- ocean selection (defaults to Atlantic) ----------
  const [ocean, setOcean] = useState<string>("Atlantic");

  // override via floatsProp if provided
  const floatsFromPreset = floatsProp ?? oceanPresets[ocean] ?? oceanPresets["Atlantic"];

  // ---------- UI state ----------
  const [visibleIds, setVisibleIds] = useState<string[]>(floatsFromPreset.map((f) => f.id));
  const [smoothCurves, setSmoothCurves] = useState<boolean>(true);
  const [showThermoclineBand, setShowThermoclineBand] = useState<boolean>(true);
  const [thermoclineRange, setThermoclineRange] = useState<{ min: number; max: number }>({ min: 50, max: 300 });
  const [depthRange, setDepthRange] = useState<{ min: number; max: number }>({ min: Math.min(...depths), max: Math.max(...depths) });

  const [plotReady, setPlotReady] = useState<boolean>(false);

  // keep visible state synced when ocean preset changes
  useEffect(() => {
    setVisibleIds(floatsFromPreset.map((f) => f.id));
    setPlotReady(false);
  }, [ocean, floatsProp]); // eslint-disable-line

  // ---------- helpers: stats & thermocline detection ----------
  function detectThermoclineDepth(temps: number[], depthsArr: number[]) {
    if (temps.length < 2 || depthsArr.length < 2) return null;
    let maxGrad = -Infinity;
    let idx = -1;
    for (let i = 0; i < Math.min(temps.length, depthsArr.length) - 1; i++) {
      const dT = temps[i] - temps[i + 1];
      const dz = depthsArr[i + 1] - depthsArr[i];
      if (dz === 0) continue;
      const grad = Math.abs(dT / dz);
      if (grad > maxGrad) {
        maxGrad = grad;
        idx = i;
      }
    }
    if (idx === -1) return null;
    const approxDepth = (depthsArr[idx] + depthsArr[idx + 1]) / 2;
    return { depth: approxDepth, gradient: maxGrad, index: idx };
  }
  function mean(arr: number[]) {
    if (arr.length === 0) return NaN;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  function stdev(arr: number[]) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(v);
  }

  const stats = useMemo(() => {
    return floatsFromPreset.map((f) => {
      const s = {
        id: f.id,
        surface: f.temps[0],
        min: Math.min(...f.temps),
        max: Math.max(...f.temps),
        mean: Number(mean(f.temps).toFixed(2)),
        stdev: Number(stdev(f.temps).toFixed(3)),
        thermocline: detectThermoclineDepth(f.temps, depths),
        color: f.color,
        emoji: f.emoji
      };
      return s;
    });
  }, [floatsFromPreset, depths]);

  // ---------- Plotly traces ----------
  const xAll = floatsFromPreset.flatMap((f) => f.temps);
  const xMin = Math.floor(Math.min(...xAll) - 1);
  const xMax = Math.ceil(Math.max(...xAll) + 1);

  // filtered indices by depthRange
  const filteredDepthIndices = depths
    .map((d, i) => ({ depth: d, idx: i }))
    .filter((d) => d.depth >= depthRange.min && d.depth <= depthRange.max)
    .map((d) => d.idx);

  const traces = floatsFromPreset
    .filter((f) => visibleIds.includes(f.id))
    .map((f) => {
      const x = filteredDepthIndices.map((i) => f.temps[i]);
      const y = filteredDepthIndices.map((i) => depths[i]);
      return {
        x,
        y,
        name: f.id,
        mode: "lines+markers",
        type: "scatter" as const,
        marker: { size: 9, line: { width: 1.8, color: "#ffffff" }, symbol: "circle" },
        line: { color: f.color ?? "#888", width: 3.5, shape: smoothCurves ? "spline" : "linear" },
        hovertemplate: `<b>${f.id}</b><br>Depth: %{y} m<br>Temp: %{x} °C<extra></extra>`
      };
    });

  // ---------- shapes & annotations ----------
  const shapes: any[] = [];
  if (showThermoclineBand) {
    shapes.push({
      type: "rect",
      xref: "x",
      yref: "y",
      x0: xMin,
      x1: xMax,
      y0: thermoclineRange.min,
      y1: thermoclineRange.max,
      fillcolor: "rgba(255,165,54,0.06)",
      line: { width: 0 },
      layer: "below"
    });
  }
  const therAnnotations: any[] = [];
  stats.forEach((s) => {
    if (!s.thermocline) return;
    if (!visibleIds.includes(s.id)) return;
    if (s.thermocline.depth < depthRange.min || s.thermocline.depth > depthRange.max) return;
    shapes.push({
      type: "line",
      xref: "x",
      yref: "y",
      x0: xMin,
      x1: xMax,
      y0: s.thermocline.depth,
      y1: s.thermocline.depth,
      line: { color: "rgba(255,90,54,0.6)", width: 1.2, dash: "dot" }
    });
    therAnnotations.push({
      x: xMax,
      y: s.thermocline.depth,
      xanchor: "left",
      text: `${s.id.split(" ")[0]} thermocline ≈ ${s.thermocline.depth} m`,
      showarrow: false,
      font: { size: 11 },
      bgcolor: theme === "dark" ? "rgba(10,20,30,0.6)" : "rgba(255,255,255,0.95)"
    });
  });

  const layout: any = {
    title: { text: `${ocean} — Temperature vs Depth`, font: { size: 18, family: "Inter, Arial, sans-serif" } },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === "dark" ? "#e6edf3" : "#0f172a", family: "Inter, Arial, sans-serif" },
    xaxis: {
      title: { text: "Temperature (°C)" },
      range: [xMin, xMax],
      gridcolor: theme === "dark" ? "#203241" : "#eef2f6",
      zeroline: false,
      dtick: 2,
      tickfont: { size: 12 }
    },
    yaxis: {
      title: { text: "Depth (m)" },
      autorange: "reversed",
      tickvals: depths.filter((d) => d >= depthRange.min && d <= depthRange.max),
      gridcolor: theme === "dark" ? "#203241" : "#eef2f6",
      zeroline: false,
      tickfont: { size: 12 }
    },
    margin: { l: 80, r: 220, t: 90, b: 70 },
    hovermode: "closest",
    shapes: shapes,
    annotations: [
      {
        x: xMax - 0.5,
        y: depthRange.min + 8,
        text: `Depth: ${depthRange.min}–${depthRange.max} m`,
        showarrow: false,
        font: { size: 11 },
        bgcolor: theme === "dark" ? "rgba(2,6,23,0.55)" : "rgba(255,255,255,0.9)"
      },
      ...therAnnotations
    ]
  };

  const config = {
    responsive: true,
    displaylogo: false,
    toImageButtonOptions: { format: "png", filename: `${ocean}_temperature_depth`, height: 900, width: 1200 }
  };

  // ---------- CSV download ----------
  function downloadCSV() {
    const header = ["depth (m)", ...floatsFromPreset.map((f) => f.id)];
    const rows = depths.map((d, i) => [String(d), ...floatsFromPreset.map((f) => (f.temps[i] !== undefined ? String(f.temps[i]) : ""))]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ocean}_float_profiles.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- quick SVG preview function (instant render) ----------
  function renderSVGPreview() {
    const w = 760;
    const h = 480;
    const pad = 52;
    const xScale = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (w - pad * 2);
    const minD = Math.min(...depths);
    const maxD = Math.max(...depths);
    const yScale = (d: number) => pad + ((d - minD) / (maxD - minD)) * (h - pad * 2);

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Quick preview">
        <rect x={0} y={0} width={w} height={h} rx={12} fill={theme === "dark" ? "#021827" : "#ffffff"} stroke={theme === "dark" ? "#042c3d" : "#eef2f6"} />
        {/* grid lines */}
        {depths.map((d) => (
          <line key={d} x1={pad} x2={w - pad} y1={yScale(d)} y2={yScale(d)} stroke={theme === "dark" ? "#072233" : "#f4f6fb"} />
        ))}
        {/* traces */}
        {floatsFromPreset.map((f) =>
          visibleIds.includes(f.id) ? (
            <g key={f.id}>
              <path
                d={f.temps.map((t, i) => `${i === 0 ? "M" : "L"} ${xScale(t)} ${yScale(depths[i])}`).join(" ")}
                fill="none"
                stroke={f.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.95}
              />
              {f.temps.map((t, i) => (
                <circle key={i} cx={xScale(t)} cy={yScale(depths[i])} r={4.4} fill={f.color} stroke="#fff" strokeWidth={1.2} />
              ))}
            </g>
          ) : null
        )}

        {/* axis labels */}
        <text x={w / 2} y={h - 12} textAnchor="middle" fontSize={13} fill={theme === "dark" ? "#9fb4c9" : "#475569"}>
          Temperature (°C)
        </text>
        <text x={14} y={h / 2} transform={`rotate(-90 14 ${h / 2})`} textAnchor="middle" fontSize={13} fill={theme === "dark" ? "#9fb4c9" : "#475569"}>
          Depth (m)
        </text>
      </svg>
    );
  }

  // ---------- handy: export report (Plotly image + metrics) ----------
  async function exportReport() {
    try {
      // @ts-ignore
      const Plotly = (window as any).Plotly;
      let imgData = null;
      if (Plotly) {
        const plotEl = document.querySelector(".compare-plotly-root .js-plotly-plot") || document.getElementById("compare-plotly");
        if (plotEl) {
          imgData = await Plotly.toImage(plotEl, { format: "png", width: 1200, height: 900 });
        }
      }
      const w = window.open("", "_blank", "noopener");
      if (!w) return alert("Popup blocked. Allow popups to export report.");
      const styles = `<style>body{font-family:Inter,Arial,sans-serif;margin:20px;color:#111} h1{font-size:18px} .metric{border-radius:8px;padding:10px;background:#f7fafc;margin:6px;display:inline-block;min-width:190px}</style>`;
      const metricHtml = stats
        .map((s) => `<div class="metric"><strong>${s.id}</strong><div>Surface: ${s.surface}°C</div><div>Min: ${s.min}°C</div><div>Mean: ${s.mean}°C</div>${s.thermocline ? `<div>Thermocline ≈ ${s.thermocline.depth} m</div>` : ""}</div>`)
        .join("");
      const rows = depths.map((d, i) => `<tr><td>${d}</td>${floatsFromPreset.map((f) => `<td>${f.temps[i] ?? ""}</td>`).join("")}</tr>`).join("");
      const headerCols = floatsFromPreset.map((f) => `<th>${f.id}</th>`).join("");
      const html = `<html><head><title>Report</title>${styles}</head><body><h1>${ocean} — Float Profiles</h1>${imgData ? `<img src="${imgData}" style="max-width:100%;border:1px solid #eee;padding:6px" />` : ""}<h2>Metrics</h2>${metricHtml}<h2>Raw data</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Depth (m)</th>${headerCols}</tr></thead><tbody>${rows}</tbody></table><script>setTimeout(()=>window.print(),600)</script></body></html>`;
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error(e);
      alert("Export failed — use Plotly camera or Download CSV as fallback.");
    }
  }

  // ---------- toggle visible ----------
  function toggleVisible(id: string) {
    setVisibleIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  // ---------- mounting behavior: Plot signals readiness via callbacks ----------
  // We will set plotReady when Plot calls onInitialized/onUpdate (below)
  // ---------- Render ----------
  return (
    <div className="min-h-screen p-6" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <div className="max-w-8xl mx-auto space-y-6">
        {/* header + controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Compare — Float Profiles</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fast researcher view · clear visuals · exportable reports · selectable ocean presets</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Ocean</label>
            <select
              value={ocean}
              onChange={(e) => setOcean(e.target.value)}
              className="px-3 py-2 border rounded bg-card text-foreground border-muted text-sm"
              aria-label="Select ocean"
            >
              {Object.keys(oceanPresets).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>

            <button onClick={downloadCSV} className="px-3 py-2 rounded bg-card border border-muted text-sm shadow-sm text-foreground hover:bg-muted">
                <Download size={16} className="inline mr-2" />
                CSV
            </button>
            <button onClick={exportReport} className="px-3 py-2 rounded bg-primary text-primary-foreground shadow-sm text-sm">
                <Printer size={16} className="inline mr-2" />
                Export
            </button>
          </div>
        </div>

        {/* main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* chart area */}
          <div className="lg:col-span-3 bg-card rounded-xl p-3 border border-muted shadow-sm relative" style={{ minHeight: 520 }}>
            {/* instant preview */}
            {!plotReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                <div className="w-full h-full rounded" style={{ maxWidth: 1200 }}>
                  {renderSVGPreview()}
                </div>
                <div className="absolute top-6 right-6 bg-black/70 text-white px-3 py-1 rounded-full text-xs">Preview — interactive chart loading</div>
              </div>
            )}

            {/* Plotly mount point (will overlay) */}
            <div id="compare-plotly" className="compare-plotly-root" style={{ width: "100%", height: 520 }}>
              <Plot
                data={traces}
                layout={layout}
                config={config}
                useResizeHandler
                style={{ width: "100%", height: "100%", visibility: plotReady ? "visible" : "hidden" }}
                onInitialized={() => setPlotReady(true)}
                onUpdate={() => setPlotReady(true)}
              />
            </div>

            {/* right-side floating legend (keeps plot uncluttered) */}
            <div className="absolute right-6 top-6 w-56 bg-card/80 backdrop-blur-md rounded-lg p-3 shadow-lg border border-muted" style={{ zIndex: 40 }}>
              <div className="text-sm font-semibold mb-2 text-foreground">Legend</div>
              <div className="space-y-2 text-sm">
                {floatsFromPreset.map((f) => (
                  <label key={f.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={visibleIds.includes(f.id)} onChange={() => toggleVisible(f.id)} />
                      <div style={{ width: 12, height: 12, background: f.color, borderRadius: 3 }} />
                      <div className="leading-tight">
                        <div className="font-medium text-xs text-foreground">{f.id}</div>
                        <div className="text-[11px] text-muted-foreground">{f.emoji} Surface {f.temps[0]}°C</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* right column: controls + stats */}
          <aside className="bg-card rounded-xl p-4 border border-muted shadow-sm">
            {/* curve style */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2 text-foreground">Visual</div>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={smoothCurves} onChange={() => setSmoothCurves((s) => !s)} />
                Smooth curves
              </label>
              <div className="mt-3 text-sm">
                <label className="inline-flex items-center gap-2 text-foreground">
                  <input type="checkbox" checked={showThermoclineBand} onChange={() => setShowThermoclineBand((s) => !s)} />
                  Show thermocline band
                </label>
                {showThermoclineBand && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <input type="number" className="px-2 py-1 border rounded bg-background text-foreground border-muted" value={thermoclineRange.min} onChange={(e) => setThermoclineRange((r) => ({ ...r, min: Number(e.target.value) }))} />
                    <input type="number" className="px-2 py-1 border rounded bg-background text-foreground border-muted" value={thermoclineRange.max} onChange={(e) => setThermoclineRange((r) => ({ ...r, max: Number(e.target.value) }))} />
                  </div>
                )}
              </div>
            </div>

            {/* depth range */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2 text-foreground">Depth range (m)</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <input type="number" className="px-2 py-1 border rounded bg-background text-foreground border-muted" value={depthRange.min} onChange={(e) => setDepthRange((d) => ({ ...d, min: Number(e.target.value) }))} />
                <input type="number" className="px-2 py-1 border rounded bg-background text-foreground border-muted" value={depthRange.max} onChange={(e) => setDepthRange((d) => ({ ...d, max: Number(e.target.value) }))} />
              </div>
            </div>

            {/* stats table compact */}
            <div>
              <div className="text-sm font-semibold mb-2 text-foreground">Float summary</div>
              <div className="overflow-auto max-h-[260px]">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left py-2">Float</th>
                      <th className="text-right py-2 pr-3">Surf</th>
                      <th className="text-right py-2 pr-3">Min</th>
                      <th className="text-right py-2 pr-3">Max</th>
                      <th className="text-right py-2 pr-3">Mean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s, idx) => (
                      <tr key={s.id} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
                        <td className="py-2 text-sm font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div style={{ width: 10, height: 10, background: s.color, borderRadius: 3 }} />
                            <div>
                              <div className="text-sm">{s.id}</div>
                              <div className="text-[11px] text-muted-foreground">{s.emoji}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-right pr-3 text-foreground">{s.surface.toFixed(2)}</td>
                        <td className="py-2 text-right pr-3 text-foreground">{s.min.toFixed(2)}</td>
                        <td className="py-2 text-right pr-3 text-foreground">{s.max.toFixed(2)}</td>
                        <td className="py-2 text-right pr-3 text-foreground">{s.mean.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* quick actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 border rounded text-sm text-foreground hover:bg-muted" onClick={() => setVisibleIds(floatsFromPreset.map((f) => f.id))}>
                Show all
              </button>
              <button className="flex-1 px-3 py-2 border rounded text-sm text-foreground hover:bg-muted" onClick={() => setVisibleIds([])}>
                Hide all
              </button>
            </div>
          </aside>
        </div>

        {/* Key takeaways — emphasized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl p-4 border border-muted shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-2 bg-primary rounded" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Key takeaways</h3>
                <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <li>
                    <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-xs font-semibold mr-2">Priority</span>
                    <strong>Warm-core detection:</strong> {stats[0] ? `${stats[0].id} shows the highest surface temperature (${stats[0].surface}°C).` : "—"}
                  </li>
                  <li>
                    <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs font-semibold mr-2">Important</span>
                    <strong>Cold intrusion / upwelling:</strong> check floats with sharp gradients (listed under thermocline detection). We highlight thermocline approximations on the chart for quick inspection.
                  </li>
                  <li>
                    <span className="inline-block px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-xs font-semibold mr-2">Note</span>
                    <strong>Convergence at depth:</strong> profiles often converge in deep layers — examine deeper bins for regional uniformity.
                  </li>
                  <li>
                    <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs font-semibold mr-2">Action</span>
                    <strong>Next steps:</strong> overlay baseline climatology, add per-measurement error (for confidence bands), and collect higher-resolution near thermocline.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-muted shadow-sm">
            <h4 className="font-semibold text-foreground">Thermocline summary</h4>
            <div className="mt-3 text-sm">
              {stats.map((s) => (
                <div key={s.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">{s.id}</div>
                    <div className="text-xs text-muted-foreground">{s.thermocline ? `${s.thermocline.depth} m` : "—"}</div>
                  </div>
                  <div className="text-[12px] text-muted-foreground">Gradient: {s.thermocline ? s.thermocline.gradient.toFixed(3) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* print styles */}
      <style jsx>{`
        @media print {
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}