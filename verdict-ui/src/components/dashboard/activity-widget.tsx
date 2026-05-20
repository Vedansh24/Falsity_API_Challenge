export default function ActivityWidget({ items }: { items?: Array<{ id: string; text: string; time?: string }> }) {
  return (
    <div className="bg-white border rounded p-4">
      <h4 className="font-semibold">Activity</h4>
      <ul className="mt-3 space-y-2 text-sm text-neutral-700">
        {(items ?? [{ id: '1', text: 'No recent activity' }]).map((it) => (
          <li key={it.id} className="border-b pb-2">{it.text} <div className="text-xs text-neutral-500">{it.time}</div></li>
        ))}
      </ul>
    </div>
  );
}
