export default function WorkflowReadinessBanner({ ready }: { ready: boolean }) {
  return (
    <div className={`rounded-lg border p-4 text-sm ${ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
      {ready ? 'Publication-ready moderation state' : 'Moderation still requires review before publication'}
    </div>
  );
}
