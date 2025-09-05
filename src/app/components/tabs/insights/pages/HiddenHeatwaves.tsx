import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DownloadCloud, Pin, Bell, Database } from "lucide-react";
import { Card, CardContent } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";


// NOTE: This file is written as a single-file React component intended
// to be dropped into a demo app (Tailwind + shadcn/ui + framer-motion + lucide-react).
// It intentionally avoids heavyweight map/chart deps so it can run in a demo environment.

export default function HiddenHeatwaves({ onBack }: { onBack: () => void }) {
  // ----- demo data (replace with real data props or fetch) -----
  const hotspots = useMemo(
    () => [
      { lon: 67, lat: 15, mag: 2.1 },
      { lon: 72, lat: 10, mag: 2.6 },
      { lon: 80, lat: 5, mag: 1.8 },
      { lon: 92, lat: -5, mag: 2.0 }
    ],
    []
  );

  // 12x12 grid sample for the depth-time heatmap (rows=depth bins, cols=months)
  const heatZ = useMemo(() => {
    const rows = 12;
    const cols = 12;
    const arr = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => Math.round((Math.sin(i / 3) + Math.cos(j / 4)) * 30) / 100)
    );
    return arr;
  }, []);

  const [sqlOpen, setSqlOpen] = useState(false);
  const [confidence] = useState(0.87);

  // ----- helpers -----
  // project lon/lat into simple SVG viewport (not geographic-accurate, but fine for demo)
  const project = (lon: number, lat: number, w = 420, h = 260) => {
    // We choose a bounding box to show Indian Ocean region roughly
    const minLon = 50;
    const maxLon = 100;
    const minLat = -15;
    const maxLat = 30;
    const x = ((lon - minLon) / (maxLon - minLon)) * w;
    const y = h - ((lat - minLat) / (maxLat - minLat)) * h;
    return [x, y];
  };

  const downloadCSV = () => {
    // flatten heatZ into CSV table: month, depth_bin, anomaly
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const rows: string[] = ["month,depth_bin,anomaly_degC"];
    heatZ.forEach((row, depthIdx) => {
      row.forEach((v, mIdx) => {
        rows.push(`${months[mIdx]},${50 + depthIdx * 10},${v}`);
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hidden_subsurface_heatwaves_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleSQL = `-- SQL used to produce this insight (truncated)\n\nWITH surf AS (\n  SELECT p.profile_id, p.lat, p.lon, l.press_dbar, l.temp_degc, p.juld\n  FROM levels l JOIN profiles p USING(profile_id)\n  WHERE l.press_dbar BETWEEN 50 AND 150\n    AND l.temp_degc < 1e5\n)\nSELECT date_trunc('day', juld) AS day, AVG(temp_degc) AS tavg\nFROM surf\nGROUP BY 1\nORDER BY 1;`;

  // ----- small components -----
  const MetricCard = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) => (
    <Card className="shadow-sm rounded-2xl p-4">
      <div className="flex flex-col">
        <div className="text-xs text-muted-foreground uppercase">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
      </div>
    </Card>
  );

  function MapViz() {
    const w = 420;
    const h = 260;
    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner p-4">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" className="rounded-lg">
          <defs>
            <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e6f2ff" />
              <stop offset="100%" stopColor="#cfe9ff" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width={w} height={h} fill="url(#sea)" rx="8" />

          {/* coastlines placeholder (subtle) */}
          <g opacity="0.06">
            <path d={`M20 200 Q100 120 220 170 T400 120`} stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* hotspots */}
          {hotspots.map((s, idx) => {
            const [x, y] = project(s.lon, s.lat, w, h);
            const r = 6 + (s.mag - 1.5) * 6;
            return (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <circle r={r + 8} fill="#ff7a59" opacity={0.12} filter="url(#glow)" />
                <circle r={r + 2} fill="#ff6b3a" opacity={0.18} />
                <circle r={r} fill="#ff3b2f" stroke="#fff" strokeWidth={0.5} />
              </g>
            );
          })}

          {/* labels for hotspots */}
          {hotspots.map((s, idx) => {
            const [x, y] = project(s.lon, s.lat, w, h);
            return (
              <text key={`t-${idx}`} x={x + 12} y={y} fontSize={11} className="fill-slate-800" fontWeight={600}>
                {`HS ${idx + 1}`}
              </text>
            );
          })}
        </svg>
      </div>
    );
  }

  function HeatmapViz() {
    const rows = heatZ.length;
    const cols = heatZ[0].length;
    const w = 520;
    const h = 260;
    const cellW = w / cols;
    const cellH = h / rows;

    const colorFor = (v: number) => {
      // v is anomaly in degC roughly between -1..+1; map to color ramp
      const pct = Math.max(0, Math.min(1, (v + 0.6) / 1.2));
      // ramp from cool->warm
      const cool = [6, 100, 200];
      const warm = [255, 90, 0];
      const r = Math.round(cool[0] + (warm[0] - cool[0]) * pct);
      const g = Math.round(cool[1] + (warm[1] - cool[1]) * pct);
      const b = Math.round(cool[2] + (warm[2] - cool[2]) * pct);
      return `rgb(${r},${g},${b})`;
    };

    return (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner p-4">
        <svg width="100%" viewBox={`0 0 ${w + 40} ${h + 40}`} className="rounded-lg">
          <g transform="translate(30, 10)">
            {/* grid cells */}
            {heatZ.map((row, i) =>
              row.map((val, j) => (
                <rect
                  key={`c-${i}-${j}`}
                  x={j * cellW}
                  y={i * cellH}
                  width={cellW}
                  height={cellH}
                  rx={4}
                  ry={4}
                  fill={colorFor(val)}
                  stroke="rgba(0,0,0,0.04)"
                />
              ))
            )}

            {/* month labels */}
            {Array.from({ length: cols }).map((_, j) => (
              <text key={`m-${j}`} x={j * cellW + cellW / 2} y={h + 14} fontSize={11} textAnchor="middle" className="fill-muted-foreground">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][j]}
              </text>
            ))}

            {/* depth labels */}
            {Array.from({ length: rows }).map((_, i) => (
              <text key={`d-${i}`} x={-6} y={i * cellH + cellH / 2 + 4} fontSize={10} textAnchor="end" className="fill-muted-foreground">
                {50 + i * 10}m
              </text>
            ))}
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="p-2" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hidden Subsurface Heatwaves</h1>
          <p className="text-sm text-muted-foreground mt-1">Detecting thermal anomalies at 50–150 m that satellites miss</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge>Temperature</Badge>
          <Badge>Arabian Sea</Badge>
          <Badge>2025</Badge>
        </div>
      </div>

      {/* summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Depth range" value={<span>50–150 m</span>} sub="Subsurface band" />
        <MetricCard label="Duration" value={<span>74 days</span>} sub="Continuous anomaly" />
        <MetricCard label="Max anomaly" value={<span>+2.3 °C</span>} sub="vs 1991–2020 climatology" />
        <MetricCard label="Confidence" value={<span>{Math.round(confidence * 100)}%</span>} sub="Model + data consistency" />
      </div>

      {/* visual + narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="lg:col-span-1"
        >
          <Card className="rounded-2xl p-4">
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">Map: hotspots & float tracks</h3>
                <div className="text-sm text-muted-foreground">Interactive demo</div>
              </div>
              <div className="mt-4">
                <MapViz />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-2xl p-4">
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">Depth–time anomaly</h3>
                <div className="text-sm text-muted-foreground">Heatmap (50–150 m)</div>
              </div>
              <div className="mt-4">
                <HeatmapViz />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  Between June and August 2025, floats in the central Arabian Sea observed a persistent warm anomaly
                  trapped between 50–150 m. These subsurface heatwaves lasted for 74 days and reached a maximum
                  anomaly of +2.3 °C above the 1991–2020 seasonal norm. These events are typically invisible to
                  satellite SST products and can affect oxygen and biological activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* evidence & actions */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="flex-1 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold">Evidence & reproducibility</h4>
              <p className="text-sm text-muted-foreground mt-1">SQL, parameters and raw data used to build this insight.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setSqlOpen(true)}>
                <Database size={16} className="mr-2" /> View SQL
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={downloadCSV}>
              <DownloadCloud size={16} className="mr-2" /> Download Data (CSV)
            </Button>
            <Button variant="outline" onClick={() => alert('Compare function — demo mode')}>
              Compare with other regions
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <strong>Parameters:</strong> region=Arabian Sea & Bay of Bengal, depth=50–150 m, QC=1–2,
            anomaly threshold=90th percentile, min duration=5 days.
          </div>
        </Card>

        <Card className="w-full lg:w-72 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold">Quick actions</h4>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Button onClick={() => alert('Pinned to report — demo mode')}>
              <Pin size={14} className="mr-2" /> Pin to Report
            </Button>
            <Button onClick={() => alert('Alert created — demo mode')}>
              <Bell size={14} className="mr-2" /> Set Alert for Reoccurrence
            </Button>
            <Button variant="ghost" onClick={() => alert('Share link copied — demo mode')}>
              Share Insight Link
            </Button>
          </div>

          <div className="mt-6 text-sm">
            <div className="text-xs text-muted-foreground">Novelty</div>
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${Math.round(confidence * 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Novelty score: {Math.round(confidence * 100)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* related insights */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-3">Related insights</h3>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[
            { title: "Thermocline Deepening", sub: "May–Aug 2025", tag: "thermocline" },
            { title: "Oxygen Minimum Expansion", sub: "Jun 2025", tag: "oxygen" },
            { title: "Surface Heatwave Co-occurrence", sub: "Jul 2025", tag: "surface" }
          ].map((r, i) => (
            <Card key={i} className="min-w-[220px] p-4 rounded-xl hover:shadow-md cursor-pointer transition-shadow" onClick={() => alert(`Open ${r.title} — demo`)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.sub}</div>
                </div>
                <Badge>{r.tag}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SQL modal (simple) */}
      {sqlOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.0 }}
            className="bg-card rounded-2xl shadow-xl w-[min(900px,95%)] p-6"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Reproducible SQL</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(sampleSQL); alert('SQL copied'); }}>Copy</Button>
                <Button onClick={() => setSqlOpen(false)}>Close</Button>
              </div>
            </div>
            <pre className="mt-4 text-sm bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-auto max-h-[60vh]">{sampleSQL}</pre>
          </motion.div>
        </div>
      )}
    </div>
  );
}
