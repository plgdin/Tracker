import AdminDashboard from '../../../components/admin/AdminDashboard';

export default function AdminDashboardWrapper({ isOrdersOnly }: { isOrdersOnly?: boolean }) {
  return <AdminDashboard isOrdersOnly={isOrdersOnly} />;
}
