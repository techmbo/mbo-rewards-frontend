import { Navigate, useParams } from "react-router-dom";

/**
 * Per-client catalog deep link → global Client Campaigns (v5) with client preselected.
 */
export function ClientCatalogPage() {
  const { clientId } = useParams();
  if (!clientId) return <Navigate to="/assignments" replace />;
  return <Navigate to={`/assignments?clientId=${encodeURIComponent(clientId)}`} replace />;
}
