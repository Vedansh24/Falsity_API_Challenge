export default function QueueWidget({ title, items }: { title?: string; items?: Array<{ id: string; label: string }> }) {
  return (
    <div className="bg-white border rounded p-4">
      <h4 className="font-semibold">{title ?? 'Queue'}</h4>
      <ul className="mt-3 text-sm">
        {(items ?? []).map((i) => (
          <li key={i.id} className="py-1 border-b">{i.label}</li>
        ))}
        {(items ?? []).length === 0 && <li className="text-neutral-500">No items</li>}
      </ul>
    </div>
  );
}
