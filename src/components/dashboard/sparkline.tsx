// Inline sparkline. preserveAspectRatio="none" lets the caller control height
// purely with CSS so the same component stays crisp from a 52px phone tile up
// to a desktop card; non-scaling-stroke keeps the line weight constant despite
// the resulting non-uniform scale.
export function Sparkline({
  values,
  className = "",
  strokeWidth = 1.6,
}: {
  values: number[];
  className?: string;
  strokeWidth?: number;
}) {
  const points = values.length === 1 ? [values[0], values[0]] : values;
  if (points.length < 2) return null;

  const width = 100;
  const height = 32;
  const top = 3;
  const max = Math.max(...points, 1);
  const step = width / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = index * step;
    const y = height - top - (value / max) * (height - top * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M${coords.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block h-7 w-full ${className}`}
    >
      <path d={area} fill="currentColor" opacity="0.2" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
