import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}