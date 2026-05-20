export default function WorkflowEvent({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
      <span className="font-medium text-neutral-900">{label}</span>
      <span className="ml-2 text-neutral-600">{status}</span>
    </div>
  );
}
