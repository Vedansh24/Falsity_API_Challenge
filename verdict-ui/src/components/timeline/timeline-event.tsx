export default function TimelineEvent({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="font-medium text-neutral-900">{title}</div>
      <div className="text-sm text-neutral-600 mt-1">{description}</div>
    </div>
  );
}
