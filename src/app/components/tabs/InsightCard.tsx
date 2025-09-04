import React from "react";


export default function InsightCard({ insight, onOpen }: { insight: any; onOpen: (id: string) => void }) {
return (
<article className="p-5 rounded-xl bg-white dark:bg-slate-800 border hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
<div>
<div className="flex items-center gap-3 mb-4">
<div className={`p-2 rounded-md bg-gradient-to-br ${insight.color} text-white`} aria-hidden>
<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
</svg>
</div>
<div>
<h3 className="text-lg font-semibold">{insight.title}</h3>
<div className="text-xs text-muted-foreground mt-1">{insight.subtitle}</div>
</div>
</div>
<p className="text-sm text-muted-foreground">{insight.lead}</p>
</div>
<div className="mt-6 flex items-center justify-between">
<div className="text-xs text-muted-foreground">Focus: {insight.focusRegion}</div>
<button
onClick={() => onOpen(insight.id)}
className={`px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r ${insight.color} shadow hover:scale-105 transition-transform`}
aria-label={`Open ${insight.title}`}
>
View Insight
</button>
</div>
</article>
);
}