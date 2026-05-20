import { redirect } from 'next/navigation';

export default function ClaimInvestigationRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/investigations/${params.id}`);
}
