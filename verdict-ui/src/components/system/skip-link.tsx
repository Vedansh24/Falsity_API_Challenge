export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="pointer-events-none fixed left-4 top-0 z-[1001] -translate-y-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-md transition-transform focus:pointer-events-auto focus:translate-y-4 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
