export default function ConfidenceIndicator({ value }: { value: number }){
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
      <div style={{width: `${pct}%`}} className="bg-green-500 h-2" />
    </div>
  );
}
