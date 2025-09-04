"use client";

import React from "react";
import dynamic from "next/dynamic";
import { X } from 'lucide-react';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function InsightDetailView({ title, onClose, theme, predictionSlider, onSliderChange, predictionLabel, children }) {
    return (
        <div className="bg-card p-6 rounded-xl shadow-lg h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-auto mt-4 space-y-6">
                {children}
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
                <label htmlFor="prediction-slider" className="text-sm font-medium text-muted-foreground">{predictionLabel}</label>
                <input
                    type="range"
                    id="prediction-slider"
                    min="0"
                    max="100"
                    value={predictionSlider}
                    onChange={onSliderChange}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
                />
            </div>
            <style jsx>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.5s ease-out forwards;
                }
                .range-sm::-webkit-slider-thumb {
                    width: 16px;
                    height: 16px;
                    background-color: var(--primary);
                    border-radius: 50%;
                    cursor: pointer;
                }
                .range-sm::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background-color: var(--primary);
                    border-radius: 50%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};