type Event = { id: string; date: string; title: string; description?: string };

export default function PublicTimeline({ events }: { events: Event[] }) {
  return (
    <ol className="border-l pl-4 space-y-4">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-neutral-400" />
          <div className="text-sm font-medium">{e.title}</div>
          <time className="text-xs text-neutral-500">{new Date(e.date).toLocaleDateString()}</time>
          {e.description && <p className="mt-1 text-neutral-600 text-sm">{e.description}</p>}
        </li>
      ))}
    </ol>
  );
}
