import Link from 'next/link';

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="py-12">
      <div className="max-w-5xl mx-auto text-center">
        <h1 id="hero-title" className="text-3xl md:text-4xl font-semibold">
          Verdict — independent public fact-checking
        </h1>
        <p className="mt-4 text-neutral-600">
          We investigate claims, evaluate evidence, and publish clear, transparent verdicts for the public.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/claims" className="inline-block btn-primary px-4 py-2 rounded">
            Explore claims
          </Link>
          <Link href="/methodology" className="inline-block px-4 py-2 rounded border">
            Our methodology
          </Link>
        </div>
      </div>
    </section>
  );
}
