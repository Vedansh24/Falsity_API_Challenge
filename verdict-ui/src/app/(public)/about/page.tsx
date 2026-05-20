import PublicLayout from '../../../layouts/public-layout';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="py-8 max-w-4xl">
        <h1 className="text-2xl font-semibold">About Verdict</h1>
        <p className="mt-4 text-neutral-700">We are an independent public fact-checking organization committed to transparency, rigorous evidence review, and public accountability.</p>
        <section className="mt-6">
          <h2 className="font-semibold">Our mission</h2>
          <p className="mt-2 text-neutral-600">To provide clear, evidence-based verdicts and make the reasoning behind those verdicts public and verifiable.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
