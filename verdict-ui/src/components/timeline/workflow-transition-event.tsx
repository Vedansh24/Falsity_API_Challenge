export default function WorkflowTransitionEvent({ title, state }: { title: string; state: string }) {
  return <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm"><div className="font-medium">{title}</div><div className="text-neutral-600">{state}</div></div>;
}
