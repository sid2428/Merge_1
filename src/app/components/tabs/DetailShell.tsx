import React from "react";
const img = await Plotly.toImage(el, { format: "png", width: 1200, height: 600 });
const a = document.createElement("a");
a.href = img; a.download = filename; a.click();
} else {
alert("Export not available in this environment.");
}
} catch (e) {
console.error(e);
}
};


const leftId = `${id}-left`;
const rightId = `${id}-right`;


return (
<>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="panel">
<div className="flex items-center justify-between mb-2">
<h4 className="font-semibold">Primary visual</h4>
<button onClick={() => exportPNG(leftId, `${id}-left.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">Download PNG</button>
</div>
<div id={leftId} className="h-72">
<Plot data={left} layout={layoutBase(subtitle)} useResizeHandler style={{ width: "100%", height: "100%" }} />
</div>
<p className="text-xs text-muted-foreground mt-3">{subtitle}</p>
</div>
<div className="panel">
<div className="flex items-center justify-between mb-2">
<h4 className="font-semibold">Secondary visual</h4>
<button onClick={() => exportPNG(rightId, `${id}-right.png`)} className="text-xs px-3 py-1 border rounded hover:bg-muted">Download PNG</button>
</div>
<div id={rightId} className="h-72">
<Plot data={right} layout={layoutBase("Detail")} useResizeHandler style={{ width: "100%", height: "100%" }} />
</div>
<p className="text-xs text-muted-foreground mt-3">Details & context for visualization.</p>
</div>
</div>


<section className="mt-6 panel">
<h4 className="font-semibold">How this was calculated</h4>
<div className="mt-3 text-sm text-muted-foreground space-y-2">
{how.map((line, idx) => (
<div key={idx} className="flex gap-3 items-start">
<div className="text-xs text-slate-400 mt-1">•</div>
<div>{line}</div>
</div>
))}
</div>
</section>
</>
);
}