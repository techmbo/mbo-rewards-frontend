import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { ClientModuleShell } from "./ClientModuleShell";
import { deliveryChannelRequirements } from "./deliveryHelpers";

function unwrap(res) {
  return res?.data ?? res;
}

/**
 * Client Workspace → Portal Users / Access.
 */
export function ClientPortalPage() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);

  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi(`/clients/${clientId}/onboarding`);
      setOnboarding(unwrap(res));
    } catch (err) {
      setError(err?.message || "Unable to load portal users.");
      setOnboarding(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) load();
  }, [clientId]);

  const client = onboarding?.client;
  const portalUsers = onboarding?.portalUsers || [];
  const { needsPortal } = deliveryChannelRequirements(client?.deliveryMethod);

  async function createPortalUser(e) {
    e.preventDefault();
    if (!canManage) return;
    if (inviteForm.password !== inviteForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await postApi(`/clients/${clientId}/portal-users`, {
        email: inviteForm.email.trim(),
        name: inviteForm.name.trim() || null,
        password: inviteForm.password,
      });
      setInviteForm({ email: "", name: "", password: "", confirmPassword: "" });
      setMessage("Portal user created. Portal login is separate from API credentials.");
      await load();
    } catch (err) {
      setMessage(err?.message || "Portal user creation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ClientModuleShell client={null} active="portal" title="Portal Users / Access" subtitle="Loading…">
        <p className="text-sm text-slate-500">Loading…</p>
      </ClientModuleShell>
    );
  }

  if (error || !client) {
    return (
      <ClientModuleShell client={null} active="portal" title="Portal Users / Access" subtitle="Unable to load">
        <p className="text-sm text-rose-600">{error || "Client not found."}</p>
      </ClientModuleShell>
    );
  }

  return (
    <ClientModuleShell
      client={client}
      active="portal"
      title="Portal Users / Access"
      subtitle="Manage who can access the client portal for this account."
    >
      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {message}
        </p>
      ) : null}

      {!needsPortal ? (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs text-amber-950">
          Delivery mode is API Only. Portal users are optional and not required for activation.
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2 font-bold">Name</th>
                <th className="px-2 py-2 font-bold">Email</th>
                <th className="px-2 py-2 font-bold">Role</th>
                <th className="px-2 py-2 font-bold">Invite</th>
                <th className="px-2 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {portalUsers.map((u) => (
                <tr key={u.id || u.email} className="border-b border-slate-100">
                  <td className="px-2 py-2.5 font-medium text-slate-900">{u.name || "—"}</td>
                  <td className="px-2 py-2.5">{u.email}</td>
                  <td className="px-2 py-2.5">Client Admin</td>
                  <td className="px-2 py-2.5">{u.invitePending ? "Pending" : "Accepted"}</td>
                  <td className="px-2 py-2.5">
                    <StatusPill
                      status={u.isActive === false ? "PENDING" : "ACTIVE"}
                      label={u.isActive === false ? "Disabled" : "Active"}
                    />
                  </td>
                </tr>
              ))}
              {!portalUsers.length ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-slate-400">
                    No portal users yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <form onSubmit={createPortalUser} className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <Input
              placeholder="Name"
              value={inviteForm.name}
              onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email"
              required
              value={inviteForm.email}
              onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Temporary password"
              required
              value={inviteForm.password}
              onChange={(e) => setInviteForm((p) => ({ ...p, password: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              required
              value={inviteForm.confirmPassword}
              onChange={(e) => setInviteForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" disabled={busy}>
                Add portal user
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </ClientModuleShell>
  );
}
