export default function ModerationChecklist({ items }: { items: Array<{ label: string; complete: boolean }> }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold text-neutral-900">Moderation Checklist</div>
      <div className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={item.complete ? 'text-emerald-600' : 'text-neutral-300'}>{item.complete ? '●' : '○'}</span>
            <span className={item.complete ? 'text-emerald-700' : 'text-neutral-600'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
