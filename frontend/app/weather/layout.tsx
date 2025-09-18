import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}