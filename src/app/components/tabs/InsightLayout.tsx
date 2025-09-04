import React from "react";
import { ArrowLeft } from "lucide-react";


export default function InsightLayout({
title,
region,
subtitle,
children,
onBack,
}: {
title: string;
region: string;
subtitle: string;
children: React.ReactNode;
onBack: () => void;
}) {
return (
<div className="min-h-[60vh]">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-4">
<button onClick={onBack} className="p-2 rounded-md hover:bg-muted transition" aria-label="Back">
<ArrowLeft size={18} />
</button>
<div>
<h2 className="text-xl font-bold">{title}</h2>
<div className="text-xs text-muted-foreground">Region: {region}</div>
</div>
</div>
<div className="text-sm text-muted-foreground">Mock visualization — replace with live data</div>
</div>
<div>{children}</div>
<style jsx>{`
.panel { @apply bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm; }
`}</style>
</div>
);
}