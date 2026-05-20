export default function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="p-6 flex-1 overflow-auto bg-neutral-50" role="main" tabIndex={-1}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}
