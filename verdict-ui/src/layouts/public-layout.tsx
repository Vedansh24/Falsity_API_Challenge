import Link from 'next/link';
import PageContainer from '../components/shared/page-container';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b py-4">
        <PageContainer>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Verdict</div>
            <nav aria-label="Primary" className="space-x-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/claims">Claims</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/about">About</Link>
              <Link href="/search">Search</Link>
            </nav>
          </div>
        </PageContainer>
      </header>
      <main className="py-8">
        <PageContainer>{children}</PageContainer>
      </main>
      <footer className="border-t py-6 mt-8">
        <PageContainer>
          <div className="text-sm text-neutral-600">© {new Date().getFullYear()} Verdict — Public fact-checking</div>
        </PageContainer>
      </footer>
    </div>
  );
}
