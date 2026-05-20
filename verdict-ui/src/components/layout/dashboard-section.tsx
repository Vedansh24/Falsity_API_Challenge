export default function DashboardSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border rounded p-4">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </section>
  );
}
