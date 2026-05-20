export default function ActivityEntry({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mt-1 h-2 w-2 rounded-full bg-neutral-400" />
      <div>
        <div className="font-medium text-neutral-900">{title}</div>
        {meta && <div className="text-sm text-neutral-600 mt-1">{meta}</div>}
      </div>
    </div>
  );
}
