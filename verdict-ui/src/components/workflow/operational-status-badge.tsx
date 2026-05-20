export default function OperationalStatusBadge({ status }: { status: 'ok' | 'warn' | 'error' }) {
  const color = status === 'ok' ? 'bg-green-100 text-green-800' : status === 'warn' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{status.toUpperCase()}</span>;
}
