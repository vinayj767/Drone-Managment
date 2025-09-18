import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}