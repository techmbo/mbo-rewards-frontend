import { ROLE_LABELS } from "../auth/permissions";
import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <PageLayout title="Profile" subtitle="Your account details">
      <Card title="Account">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium">{user?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium">{ROLE_LABELS[user?.role] || user?.role}</dd>
          </div>
        </dl>
      </Card>
    </PageLayout>
  );
}
