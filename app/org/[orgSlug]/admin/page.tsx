import { redirect } from 'next/navigation'

export default function AdminPage({ params }: { params: { orgSlug: string } }) {
  redirect(`/org/${params.orgSlug}/admin/dashboard`)
}
