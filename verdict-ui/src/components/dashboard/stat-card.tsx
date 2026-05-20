export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded p-3 text-center">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
