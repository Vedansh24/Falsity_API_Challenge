export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }){
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}
