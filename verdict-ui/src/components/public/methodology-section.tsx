export default function MethodologySection() {
  return (
    <section aria-labelledby="methodology-title" className="py-8">
      <div className="max-w-4xl mx-auto">
        <h2 id="methodology-title" className="text-2xl font-semibold">How we evaluate claims</h2>
        <p className="mt-3 text-neutral-600">
          We follow a transparent process: collect evidence, evaluate sources, score credibility, and publish a reasoning summary with confidence.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-5 text-neutral-700">
          <li>Evidence collection and provenance check</li>
          <li>Independent source verification</li>
          <li>Verdict engine with explainable scoring</li>
          <li>Public reasoning and citation transparency</li>
        </ul>
      </div>
    </section>
  );
}
