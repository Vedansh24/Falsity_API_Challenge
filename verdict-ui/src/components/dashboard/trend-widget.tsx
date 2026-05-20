export default function TrendWidget({ title }: { title?: string }) {
  return (
    <div className="bg-white border rounded p-4">
      <h4 className="font-semibold">{title ?? 'Trends'}</h4>
      <div className="mt-3 text-sm text-neutral-600">Trend charts will be mounted here (placeholder).</div>
    </div>
  );
}
