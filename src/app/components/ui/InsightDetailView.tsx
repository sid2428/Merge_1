"use client";

import React, { FC } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Download } from "lucide-react";

// Dynamic import for Plotly to ensure it runs only on the client
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/**
 * Represents the detailed view for a single insight.
 * Displays primary and secondary visuals, and a breakdown of the methodology.
 */
export default function InsightDetailView({ insight, onBack, theme }: { insight: any; onBack: () => void; theme: 'light' | 'dark' }) {
  const { left, right } = insight.mockTraces();

  // Basic layout settings for the plots, consistent with the app's theme
  const plotLayout = (title: string, y_title?: string) => ({
    title: { text: title, font: { size: 16, color: theme === 'dark' ? '#e6edf3' : '#2d3748' } },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === 'dark' ? '#cbd5e1' : '#4a5568', family: "Inter, Arial, sans-serif" },
    xaxis: { gridcolor: theme === 'dark' ? '#2d3748' : '#e2e8f0', zeroline: false },
    yaxis: { title: y_title, gridcolor: theme === 'dark' ? '#2d3748' : '#e2e8f0', zeroline: false, autorange: 'reversed' },
    margin: { t: 40, b: 40, l: 50, r: 20 },
    legend: { orientation: "h", y: -0.15 },
    hovermode: "closest",
    responsive: true
  });
  
  // Custom function to export the Plotly graph as a PNG
  const exportPNG = async (plotId: string, filename: string) => {
    try {
      const el = document.getElementById(plotId);
      if (el && (window as any).Plotly && (window as any).Plotly.toImage) {
        const imgData = await (window as any).Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
        const a = document.createElement("a");
        a.href = imgData;
        a.download = filename;
        a.click();
      } else {
        // Use a modal or a simpler message since alert() is not allowed
        console.error("Export not available. Plotly or the plot element might be missing.");
      }
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="Back to insights">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{insight.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Region: {insight.focusRegion}</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar">
        {/* Main visual panels */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="panel bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground/90">Primary Visual</h4>
              <button onClick={() => exportPNG(`${insight.id}-left`, `${insight.id}-primary.png`)} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1">
                <Download size={12} />
                PNG
              </button>
            </div>
            <div id={`${insight.id}-left`} className="h-80">
              <Plot
                data={left}
                layout={plotLayout(insight.subtitle)}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <div className="panel bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground/90">Supporting Visual</h4>
              <button onClick={() => exportPNG(`${insight.id}-right`, `${insight.id}-secondary.png`)} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1">
                <Download size={12} />
                PNG
              </button>
            </div>
            <div id={`${insight.id}-right`} className="h-80">
              <Plot
                data={right}
                layout={plotLayout("Detail")}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </section>

        {/* Methodology section */}
        <section className="panel bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md animate-fade-in">
          <h4 className="text-lg font-semibold text-foreground/90 mb-4">How this was calculated</h4>
          <ul className="space-y-4">
            {insight.how.map((line: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-primary font-bold text-sm">{idx + 1}.</span>
                <p className="text-sm">{line}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
