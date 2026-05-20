import Button from '../ui/button';

interface EvidenceActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

export default function EvidenceActions({ onEdit, onDelete, onPreview }: EvidenceActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {onPreview && <Button variant="ghost" size="sm" onClick={onPreview}>Preview</Button>}
      {onEdit && <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>}
      {onDelete && <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>}
    </div>
  );
}
