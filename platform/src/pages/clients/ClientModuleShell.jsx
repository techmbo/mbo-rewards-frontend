import { Link, useParams } from "react-router-dom";
import { StatusPill } from "../../components/ui/StatusPill";
import { deliveryMethodLabel } from "./deliveryHelpers";
import { NetworkFilter, useClientOpsNetworkFilter } from "./NetworkFilter";

const TABS = [
  { id: "setup", label: "Setup", path: "setup" },
  { id: "agreement", label: "Agreement", path: "agreement" },
  { id: "api", label: "API", path: "api" },
  { id: "portal", label: "Portal Users", path: "portal" },
  { id: "catalog", label: "Campaigns", path: "catalog" },
  { id: "activation", label: "Activation", path: "activation" },
];

/**
 * Client Workspace shell — admin view of one client (HTML Client Operations v5 IA).
 */
export function ClientModuleShell({
  client,
  active,
  title,
  subtitle,
  actions = null,
  children,
  /** Hide when a page already renders its own Network filter in a denser toolbar. */
  showNetworkFilter = true,
}) {
  const { clientId } = useParams();
  const id = clientId || client?.id;
  const agreementOk = String(client?.agreementStatus || "").toUpperCase() === "SIGNED";
  const [network, setNetwork] = useClientOpsNetworkFilter();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Client Operations / <span className="text-slate-700">{client?.name || "Client"}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {showNetworkFilter ? (
            <NetworkFilter
              id={`shell-network-${active || "client"}`}
              value={network}
              onChange={setNetwork}
              className="min-w-[180px]"
            />
          ) : null}
          <Link
            to="/clients"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            ← All clients
          </Link>
          {actions}
        </div>
      </div>

      {client ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
            {(client.name || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900">{client.name}</h2>
            <p className="text-xs text-slate-500">
              {[client.country, client.industry || client.category].filter(Boolean).join(" · ") || "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusPill
                status={client.status === "ACTIVE" ? "ACTIVE" : "PENDING"}
                label={client.status || "—"}
              />
              <StatusPill
                status={agreementOk ? "ACTIVE" : "PENDING"}
                label={agreementOk ? "Agreement signed" : "Agreement pending"}
              />
              {client.commercialModel ? (
                <StatusPill status="ACTIVE" label="Commercials configured" />
              ) : (
                <StatusPill status="PENDING" label="Commercials pending" />
              )}
              <StatusPill status="UNKNOWN" label={deliveryMethodLabel(client.deliveryMethod)} />
            </div>
          </div>
        </div>
      ) : null}

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" aria-label="Client workspace">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const to = tab.path ? `/clients/${id}/${tab.path}` : `/clients/${id}`;
          return (
            <Link
              key={tab.id}
              to={to}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-transparent bg-white text-slate-600 hover:border-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
