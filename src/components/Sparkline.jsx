export default function Sparkline({ data = [], color = "#38bdf8", width = 96, height = 28 }) {
  if (!data.length) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 3 - ((v - min) / range) * (height - 6)).toFixed(1)}`);
  return (
    <svg width={width} height={height} className="opacity-90" aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
