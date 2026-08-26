import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { formatDate } from "../helpers";

const COLUMNS = [
  { key: "action", label: "Action" },
  { key: "user", label: "User", render: (row) => row.user?.email ?? "—" },
  { key: "resource", label: "Resource" },
  { key: "ipAddress", label: "IP" },
  { key: "createdAt", label: "Time", render: (row) => formatDate(row.createdAt) },
];

export function AccessLogsPage() {
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/logs/access",
    {},
    { pageSize: 25 },
  );

  return (
    <PageLayout title="Access Logs" subtitle="Platform access audit trail">
      <DataTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRefresh={reload}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No access logs"
        emptyDescription="User activity will be recorded here."
      />
    </PageLayout>
  );
}
