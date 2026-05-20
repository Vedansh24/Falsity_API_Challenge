import Input from '../ui/input';
import Button from '../ui/button';

interface EvidenceFormProps {
  onSubmit?: (values: { sourceUrl: string; sourceType: string; stance: string }) => void;
  defaultValues?: { sourceUrl?: string; sourceType?: string; stance?: string };
}

export default function EvidenceForm({ onSubmit, defaultValues }: EvidenceFormProps) {
  return (
    <form
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({
          sourceUrl: String((event.currentTarget.elements.namedItem('sourceUrl') as HTMLInputElement)?.value ?? ''),
          sourceType: String((event.currentTarget.elements.namedItem('sourceType') as HTMLInputElement)?.value ?? ''),
          stance: String((event.currentTarget.elements.namedItem('stance') as HTMLInputElement)?.value ?? '')
        });
      }}
    >
      <Input name="sourceUrl" placeholder="Source URL" defaultValue={defaultValues?.sourceUrl} />
      <Input name="sourceType" placeholder="Source type" defaultValue={defaultValues?.sourceType} />
      <Input name="stance" placeholder="Stance" defaultValue={defaultValues?.stance} />
      <Button type="submit">Save evidence</Button>
    </form>
  );
}
