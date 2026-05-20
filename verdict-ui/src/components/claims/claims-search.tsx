"use client";

import Button from '../ui/button';
import Input from '../ui/input';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function ClaimsSearch({ value, onChange, placeholder = 'Search claims by title, status, category, or analyst' }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search claims"
      />
      {value && (
        <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100" onClick={() => onChange('')}>
          Clear
        </Button>
      )}
    </div>
  );
}
