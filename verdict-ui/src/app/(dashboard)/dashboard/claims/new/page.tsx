"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Button from '../../../../../components/ui/button';
import Input from '../../../../../components/ui/input';
import FormField from '../../../../../components/forms/form-field';
import { createClaimSchema, type CreateClaimDto } from '../../../../../schemas/claims.schema';
import { useCreateClaimMutation } from '../../../../../hooks/use-claims';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unable to create the claim. Please try again.';
}

export default function NewClaimPage() {
  const router = useRouter();
  const createClaimMutation = useCreateClaimMutation();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateClaimDto>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      sourceUrl: '',
      tags: '',
      initialMetadata: ''
    }
  });

  const onSubmit = async (values: CreateClaimDto) => {
    try {
      const tags = values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const metadata = values.initialMetadata.trim();
      const parsedMetadata = metadata ? (JSON.parse(metadata) as Record<string, unknown>) : {};
      const payload = {
        title: values.title.trim(),
        statement: `${values.title.trim()}\n\n${values.description.trim()}`,
        description: values.description.trim(),
        category: values.category.trim() || undefined,
        sourceUrl: values.sourceUrl.trim() || undefined,
        tags,
        metadata: parsedMetadata
      };

      const created = await createClaimMutation.mutateAsync(payload as Record<string, unknown>);
      router.replace(`/dashboard/claims/${created.id}`);
    } catch {
      // handled in UI
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create claim" subtitle="Capture a new claim and seed the operational queue with workflow metadata." />

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Claim title" error={errors.title?.message}>
            <Input placeholder="Enter a concise claim title" {...register('title')} />
          </FormField>

          <FormField label="Claim description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={7}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Describe the claim, context, and what should be reviewed."
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category" error={errors.category?.message} hint="Used for queue filtering and future workflow routing.">
              <Input placeholder="Politics, health, technology..." {...register('category')} />
            </FormField>

            <FormField label="Source URL" error={errors.sourceUrl?.message} hint="Optional reference source for the claim.">
              <Input type="url" placeholder="https://example.com/source" {...register('sourceUrl')} />
            </FormField>
          </div>

          <FormField label="Tags" error={errors.tags?.message} hint="Comma-separated tags for queue scanning and search.">
            <Input placeholder="breaking, election, policy" {...register('tags')} />
          </FormField>

          <FormField label="Initial metadata" error={errors.initialMetadata?.message} hint='Optional JSON for lightweight workflow metadata, e.g. {"priority":"high"}'>
            <textarea
              {...register('initialMetadata')}
              rows={5}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder='{"priority":"high"}'
            />
          </FormField>

          {createClaimMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(createClaimMutation.error)}</div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createClaimMutation.isLoading}>
              {createClaimMutation.isLoading ? 'Creating claim...' : 'Create claim'}
            </Button>
            <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
