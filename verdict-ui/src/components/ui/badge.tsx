export default function Badge({ children, className }: { children: React.ReactNode; className?: string }){
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm bg-gray-100 text-gray-800 ${className ?? ''}`}>{children}</span>;
}
