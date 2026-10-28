const nodes = [
  { x: 90, y: 250, r: 7, label: "edge-r1" },
  { x: 210, y: 130, r: 6, label: "core-sw" },
  { x: 220, y: 360, r: 6, label: "fw-01" },
  { x: 350, y: 240, r: 9, label: "acx-auto" },
  { x: 480, y: 110, r: 6, label: "vpc-a" },
  { x: 500, y: 380, r: 6, label: "vpc-b" },
  { x: 600, y: 245, r: 7, label: "transit" },
];
const links: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 4],
];

export function NetworkTopology() {
  return (
    <svg viewBox="0 0 680 480" className="h-full w-full" role="img" aria-label="Abstract network topology connecting on-premise devices to cloud networks through an automation node">
      <defs>
        <linearGradient id="lk" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--violet)" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="var(--electric)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--electric)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* cloud boundary */}
      <rect x="430" y="70" width="220" height="350" rx="28" fill="none" stroke="var(--ink-border)" strokeDasharray="4 6" />
      <text x="446" y="96" fill="var(--ink-muted)" fontSize="11" fontFamily="var(--font-mono)">cloud · 10.20.0.0/16</text>
      <rect x="40" y="70" width="230" height="350" rx="28" fill="none" stroke="var(--ink-border)" strokeDasharray="4 6" />
      <text x="56" y="96" fill="var(--ink-muted)" fontSize="11" fontFamily="var(--font-mono)">on-prem · 10.10.0.0/16</text>
      <circle cx="350" cy="240" r="120" fill="url(#glow)" />
      {links.map(([a, b], i) => {
        const from = nodes[a];
        const to = nodes[b];
        if (!from || !to) return null;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--ink-border)" strokeWidth="1.5" />
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="url(#lk)" strokeWidth="1.8" strokeDasharray="6 14" className="animate-dash"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={n.r + 8} fill="var(--electric)" opacity="0.15" className="animate-node" style={{ animationDelay: `${i * 0.4}s` }} />
          <circle cx={n.x} cy={n.y} r={n.r} fill="var(--ink)" stroke={i === 3 ? "var(--cyan)" : "var(--electric)"} strokeWidth="2" />
          <text x={n.x} y={n.y + n.r + 18} textAnchor="middle" fill="var(--ink-muted)" fontSize="11" fontFamily="var(--font-mono)">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}
