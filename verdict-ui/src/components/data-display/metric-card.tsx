export default function MetricCard({ title, value, delta }: { title: string; value: string | number; delta?: string }){
  return (
    <div className="bg-white rounded p-4 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {delta && <div className="text-sm text-green-600">{delta}</div>}
    </div>
  );
}
