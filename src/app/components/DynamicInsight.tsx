"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bot, CheckCircle, Cpu, FileText, Loader, Zap } from "lucide-react";

// Helper components for the dynamic steps
const InsightStep = ({ icon, title, children, isVisible }: any) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="flex items-start gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="mt-1 flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="mt-2 text-muted-foreground">{children}</div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StatusIcon = ({ status }: { status: "pending" | "in_progress" | "complete" }) => {
  if (status === "in_progress") {
    return <Loader size={24} className="animate-spin text-primary" />;
  }
  if (status === "complete") {
    return <CheckCircle size={24} className="text-green-500" />;
  }
  return <Zap size={24} className="text-muted-foreground/50" />;
};


// Main Dynamic Insight Component
export default function DynamicInsight({ insight, onBack }: { insight: any, onBack: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        "Initiating Analysis",
        "Interpreting User Query",
        "Fetching Raw Data",
        "Analyzing Data Points",
        "Generating Visualizations",
        "Finalizing Insight"
    ];

    useEffect(() => {
        setCurrentStep(0);
        const timers = steps.map((_, index) =>
            setTimeout(() => {
                setCurrentStep(index + 1);
            }, (index + 1) * 1500) // Stagger the appearance of each step
        );
        return () => timers.forEach(clearTimeout);
    }, [insight]); // Rerun the animation when a new insight is triggered


    // ----- MOCK DATA & VISUALIZATION HELPERS (from HiddenHeatwaves) -----
     const heatZ = useMemo(() => {
        const rows = 12;
        const cols = 12;
        return Array.from({ length: rows }, (_, i) =>
          Array.from({ length: cols }, (_, j) => Math.round((Math.sin(i / 3) + Math.cos(j / 4)) * 30) / 100)
        );
      }, []);

    function HeatmapViz() {
        const rows = heatZ.length;
        const cols = heatZ[0].length;
        const w = 520;
        const h = 260;
        const cellW = w / cols;
        const cellH = h / rows;

        const colorFor = (v: number) => {
            const pct = Math.max(0, Math.min(1, (v + 0.6) / 1.2));
            const cool = [6, 100, 200];
            const warm = [255, 90, 0];
            const r = Math.round(cool[0] + (warm[0] - cool[0]) * pct);
            const g = Math.round(cool[1] + (warm[1] - cool[1]) * pct);
            const b = Math.round(cool[2] + (warm[2] - cool[2]) * pct);
            return `rgb(${r},${g},${b})`;
        };

        return (
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner p-4 mt-2">
                <svg width="100%" viewBox={`0 0 ${w + 40} ${h + 40}`} className="rounded-lg">
                <g transform="translate(30, 10)">
                    {heatZ.map((row, i) =>
                    row.map((val, j) => (
                        <rect key={`c-${i}-${j}`} x={j * cellW} y={i * cellH} width={cellW} height={cellH} rx={4} ry={4} fill={colorFor(val)} stroke="rgba(0,0,0,0.04)" />
                    ))
                    )}
                    {Array.from({ length: cols }).map((_, j) => (
                    <text key={`m-${j}`} x={j * cellW + cellW / 2} y={h + 14} fontSize={11} textAnchor="middle" className="fill-muted-foreground">
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][j]}
                    </text>
                    ))}
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
        <motion.div 
            className="h-full flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-6 p-4 border-b border-border">
                <button className="p-2 rounded-full hover:bg-muted" onClick={onBack}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{insight.title}</h1>
                    <p className="text-sm text-muted-foreground">{insight.subtitle}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 custom-scrollbar">
                <InsightStep icon={<StatusIcon status={currentStep > 1 ? "complete" : "in_progress"} />} title="Interpreting Query" isVisible={currentStep >= 1}>
                    <p>User query identified: <span className="font-semibold text-primary">"{insight.query}"</span>. Parsing intent for data analysis.</p>
                </InsightStep>

                <InsightStep icon={<StatusIcon status={currentStep > 2 ? "complete" : currentStep === 2 ? "in_progress" : "pending"} />} title="Fetching Raw Data" isVisible={currentStep >= 2}>
                    <p>Accessing ARGO float database for records matching criteria: <span className="font-semibold">Indian Ocean, 50-150m depth, last 12 months.</span></p>
                    <div className="mt-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-xs font-mono">
                        <p><strong>Floats found:</strong> 4</p>
                        <p><strong>Data points:</strong> 1,280 temperature readings</p>
                        <p><strong>Status:</strong> Data loaded successfully.</p>
                    </div>
                </InsightStep>

                <InsightStep icon={<StatusIcon status={currentStep > 3 ? "complete" : currentStep === 3 ? "in_progress" : "pending"} />} title="Analyzing Anomalies" isVisible={currentStep >= 3}>
                    <p>Calculating temperature deviations from the climatological mean. Identifying significant continuous periods of warming.</p>
                </InsightStep>

                 <InsightStep icon={<StatusIcon status={currentStep > 4 ? "complete" : currentStep === 4 ? "in_progress" : "pending"} />} title="Generating Visualization" isVisible={currentStep >= 4}>
                    <p>Plotting depth-time anomaly heatmap to visualize the subsurface heatwave event.</p>
                    <HeatmapViz />
                </InsightStep>
                
                <InsightStep icon={<StatusIcon status={currentStep > 5 ? "complete" : currentStep === 5 ? "in_progress" : "pending"} />} title="Finalizing Insight" isVisible={currentStep >= 5}>
                    <p className="font-semibold">Conclusion:</p>
                    <p>Between January and May, the Arabian Sea developed a hidden heatwave trapped 70–110m below the surface. At its strongest in March–April, this subsurface layer warmed nearly 2°C above normal and stayed hot for almost 5 months. While invisible to satellites, this heat acted like a thermal lid—reducing nutrient supply, weakening plankton growth, and quietly stressing marine ecosystems. By year’s end, the system flipped: cooling dominated the deeper layers, hinting at strong seasonal cycles that could shape future heatwave events.</p>
                </InsightStep>
            </div>
        </motion.div>
    );
}
