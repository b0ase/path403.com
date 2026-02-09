import AdminLayoutClient from './layout.client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware - just render the admin layout
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
} 