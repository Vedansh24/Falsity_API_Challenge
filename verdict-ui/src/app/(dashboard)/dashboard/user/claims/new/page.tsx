"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '../../../../../../components/shared/page-header';
import Card from '../../../../../../components/ui/card';
import Button from '../../../../../../components/ui/button';
import Input from '../../../../../../components/ui/input';
import FormField from '../../../../../../components/forms/form-field';
import { createClaimSchema, type CreateClaimDto } from '../../../../../../schemas/claims.schema';
import { useCreateClaimMutation } from '../../../../../../hooks/use-claims';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Unable to submit claim. Please try again.';
}

export default function UserNewClaimPage() {
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
      const tags = values.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const metadataRaw = values.initialMetadata.trim();
      const metadata = metadataRaw ? (JSON.parse(metadataRaw) as Record<string, unknown>) : {};

      const created = await createClaimMutation.mutateAsync({
        title: values.title.trim(),
        statement: `${values.title.trim()}\n\n${values.description.trim()}`,
        description: values.description.trim(),
        category: values.category.trim() || undefined,
        sourceUrl: values.sourceUrl.trim() || undefined,
        tags,
        metadata
      } as Record<string, unknown>);

      router.replace(`/dashboard/user/claims/${created.id}`);
    } catch {
      // handled by mutation state
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit a claim"
        subtitle="Provide the claim details for investigation and transparent workflow tracking."
      />

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Claim title" error={errors.title?.message}>
            <Input placeholder="Enter the claim headline" {...register('title')} />
          </FormField>

          <FormField label="Claim description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={7}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30"
              placeholder="Describe the claim context and why it should be reviewed."
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category" error={errors.category?.message}>
              <Input placeholder="Health, politics, technology..." {...register('category')} />
            </FormField>

            <FormField label="Source URL" error={errors.sourceUrl?.message}>
              <Input type="url" placeholder="https://example.com" {...register('sourceUrl')} />
            </FormField>
          </div>

          <FormField label="Tags" error={errors.tags?.message} hint="Comma-separated tags to improve discoverability.">
            <Input placeholder="election, policy, speech" {...register('tags')} />
          </FormField>

          <FormField label="Initial metadata" error={errors.initialMetadata?.message} hint='Optional JSON, e.g. {"priority":"normal"}'>
            <textarea
              {...register('initialMetadata')}
              rows={4}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30"
              placeholder='{"priority":"normal"}'
            />
          </FormField>

          {createClaimMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getErrorMessage(createClaimMutation.error)}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createClaimMutation.isLoading}>
              {createClaimMutation.isLoading ? 'Submitting…' : 'Submit claim'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
