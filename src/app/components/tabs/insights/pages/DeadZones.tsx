"use client";

import React from "react";
import InsightDetailView from "@/components/ui/InsightDetailView";

export default function DeadZones({ insight, onBack }: any) {
  return <InsightDetailView insight={insight} onBack={onBack} />;
}