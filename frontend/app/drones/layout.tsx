import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function DronesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}