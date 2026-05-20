export default function ReviewerEvent({ title, detail }: { title: string; detail?: string }) {
  return <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm"><div className="font-medium">{title}</div>{detail && <div className="text-neutral-600">{detail}</div>}</div>;
}
