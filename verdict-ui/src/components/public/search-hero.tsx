export default function SearchHero() {
  return (
    <section className="py-6">
      <div className="max-w-4xl mx-auto">
        <label htmlFor="public-search" className="sr-only">Search claims</label>
        <input id="public-search" name="q" placeholder="Search claims, sources, or verdicts" className="w-full border rounded px-3 py-2" />
      </div>
    </section>
  );
}
