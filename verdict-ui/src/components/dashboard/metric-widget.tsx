export default function MetricWidget({ title, value, delta }: { title: string; value: string | number; delta?: string }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
      {delta && <div className="text-xs text-neutral-500 mt-1">{delta}</div>}
    </div>
  );
}
