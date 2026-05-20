export default function EmptyState({ title, subtitle }: { title?: string; subtitle?: string }){
  return (
    <div className="text-center py-12">
      <div className="text-2xl font-semibold">{title ?? 'No results'}</div>
      {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
