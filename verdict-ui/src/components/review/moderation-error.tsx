export default function ModerationError({ message = 'Failed to load moderation workspace' }: { message?: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{message}</div>;
}
