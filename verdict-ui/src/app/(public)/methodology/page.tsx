import PublicLayout from '../../../layouts/public-layout';
import MethodologySection from '../../../components/public/methodology-section';

export default function MethodologyPage() {
  return (
    <PublicLayout>
      <div className="py-8">
        <h1 className="text-2xl font-semibold">Methodology</h1>
        <p className="mt-3 text-neutral-600">An overview of how claims are reviewed, evidence is evaluated, and verdicts are published.</p>
        <div className="mt-6">
          <MethodologySection />
        </div>
      </div>
    </PublicLayout>
  );
}
