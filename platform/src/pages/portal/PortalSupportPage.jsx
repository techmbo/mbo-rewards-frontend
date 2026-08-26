import { useCallback, useEffect, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { Icon } from "../../components/ui/Icon";
import { copyText, unwrap } from "./portalUtils";

export function PortalSupportPage() {
  const [apiDocs, setApiDocs] = useState(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [ticket, setTicket] = useState({ category: "Campaign issue", body: "" });
  const [campaignReq, setCampaignReq] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysError, setKeysError] = useState("");
  const [rotating, setRotating] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);

  const loadApiKeys = useCallback(async () => {
    setKeysLoading(true);
    setKeysError("");
    try {
      const res = await fetchApi("/portal/v1/api-keys");
      setApiKeys(unwrap(res) || []);
    } catch (err) {
      setKeysError(err.message || "Failed to load API keys.");
      setApiKeys([]);
    } finally {
      setKeysLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function openDocs() {
    try {
      const res = await fetchApi("/portal/v1/api-docs");
      setApiDocs(unwrap(res));
      setDocsOpen(true);
    } catch (err) {
      setToast(err.message || "Could not load API docs");
    }
  }

  async function submitTicket() {
    setSaving(true);
    try {
      await postApi("/portal/v1/support", {
        type: "SUPPORT_TICKET",
        category: ticket.category,
        subject: ticket.category,
        body: ticket.body,
      });
      setTicketOpen(false);
      setTicket({ category: "Campaign issue", body: "" });
      setToast("Support request submitted");
    } catch (err) {
      setToast(err.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  }

  async function submitCampaignRequest() {
    setSaving(true);
    try {
      await postApi("/portal/v1/support", {
        type: "CAMPAIGN_REQUEST",
        subject: "Campaign request",
        body: campaignReq,
      });
      setRequestOpen(false);
      setCampaignReq("");
      setToast("Campaign request submitted");
    } catch (err) {
      setToast(err.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  }

  async function rotateKey() {
    if (
      !window.confirm(
        "This revokes your current API key and issues a new one. Any integrations using the old key will stop working until you update them. Continue?",
      )
    ) {
      return;
    }
    setRotating(true);
    try {
      const res = await postApi("/portal/v1/api-keys/rotate", { name: "Default" });
      const issued = unwrap(res);
      setRevealedKey(issued?.apiKey || null);
      setToast(issued?.apiKey ? "New API key issued — copy it now" : "API key rotated");
      await loadApiKeys();
    } catch (err) {
      setToast(err.message || "Could not rotate API key");
    } finally {
      setRotating(false);
    }
  }

  const activeKey = (apiKeys || []).find((k) => k.isActive) || null;

  const cards = [
    {
      icon: "description",
      title: "API documentation",
      body: "Integration details for assigned campaign data.",
      action: "Open API Docs",
      onClick: openDocs,
      primary: true,
    },
    {
      icon: "mail",
      title: "Contact MBO support",
      body: "Report campaign, tracking, performance or payment issues.",
      action: "Create support request",
      onClick: () => setTicketOpen(true),
      primary: true,
    },
    {
      icon: "add",
      title: "Request campaigns",
      body: "Request additional brands or markets.",
      action: "Request campaigns",
      onClick: () => setRequestOpen(true),
    },
    {
      icon: "person",
      title: "Account manager",
      body: (
        <>
          <strong className="text-slate-900">MBO Client Success</strong>
          <br />
          support@mbo.international
        </>
      ),
      action: "Copy email",
      onClick: () => copyText("support@mbo.international", setToast),
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-[17px] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">API key</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Use this key with{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">GET /api/v1/client/campaigns</code>. Send{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">Authorization: Bearer mbo_live_…</code>.
              The secret is shown only once after create/rotate.
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-extrabold ${
              activeKey ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
            }`}
          >
            {activeKey ? "Active" : "Not issued"}
          </span>
        </div>

        {keysLoading ? (
          <p className="mt-4 text-sm text-slate-400">Loading API key…</p>
        ) : keysError ? (
          <p className="mt-4 text-sm text-rose-600">{keysError}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {revealedKey ? (
              <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-950">
                  Copy this API key now. It will not be shown again.
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 break-all font-mono text-sm text-slate-800">
                    {revealedKey}
                  </code>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                    onClick={() => copyText(revealedKey, setToast)}
                  >
                    Copy key
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900"
                    onClick={() => setRevealedKey(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            {activeKey ? (
              <>
                <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Key metadata
                  </span>
                  <code className="mt-1.5 block font-mono text-sm text-slate-800">
                    {activeKey.keyPrefix}
                    {"•".repeat(24)}
                  </code>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {activeKey.note ||
                      "The full secret cannot be recovered. Rotate to issue a new key if you lost it."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {activeKey.name ? <span>Name: {activeKey.name}</span> : null}
                  {activeKey.createdAt ? (
                    <span>· Issued {new Date(activeKey.createdAt).toLocaleDateString("en-GB")}</span>
                  ) : null}
                  {activeKey.lastUsedAt ? (
                    <span>· Last used {new Date(activeKey.lastUsedAt).toLocaleDateString("en-GB")}</span>
                  ) : (
                    <span>· Not used yet</span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={rotating}
                  className="rounded-[10px] border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-60"
                  onClick={rotateKey}
                >
                  {rotating ? "Rotating…" : "Rotate API key"}
                </button>
              </>
            ) : (
              <div>
                <p className="text-sm text-slate-500">No active API key on this account yet.</p>
                <button
                  type="button"
                  disabled={rotating}
                  className="mt-3 rounded-[10px] bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  onClick={rotateKey}
                >
                  {rotating ? "Creating…" : "Create API key"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[17px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-blue-50 text-blue-600">
              <Icon name={card.icon} size={22} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{card.body}</p>
            <button
              type="button"
              className={`mt-4 rounded-[10px] px-3 py-2 text-xs font-semibold ${
                card.primary
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-slate-100 text-slate-800"
              }`}
              onClick={card.onClick}
            >
              {card.action}
            </button>
          </div>
        ))}
      </div>

      <Modal open={docsOpen} title="API Docs" onClose={() => setDocsOpen(false)}>
        {apiDocs ? (
          <div className="space-y-2.5 text-sm">
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
              <span className="block text-xs text-slate-400">Canonical base path</span>
              <strong className="mt-1 block font-mono text-xs">
                {apiDocs.canonicalBaseUrl || apiDocs.baseUrl}
              </strong>
            </div>
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
              <span className="block text-xs text-slate-400">Authentication</span>
              <strong className="mt-1 block font-mono text-xs">
                {apiDocs.auth?.primary || apiDocs.auth?.header}
              </strong>
              <span className="mt-1 block text-xs text-slate-500">{apiDocs.auth?.alternative}</span>
            </div>
            {(apiDocs.endpoints || []).map((ep) => (
              <div key={ep.fullPath || ep.path} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                <span className="block text-xs text-slate-400">{ep.method}</span>
                <strong className="mt-1 block font-mono text-xs">{ep.fullPath || ep.path}</strong>
                <span className="mt-1 block text-xs text-slate-500">{ep.description}</span>
              </div>
            ))}
            {(apiDocs.notes || []).map((note) => (
              <p key={note} className="text-xs text-slate-500">
                • {note}
              </p>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={ticketOpen}
        title="Create support request"
        onClose={() => setTicketOpen(false)}
        footer={
          <button
            type="button"
            disabled={saving || !ticket.body.trim()}
            className="rounded-[10px] bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={submitTicket}
          >
            {saving ? "Submitting…" : "Submit request"}
          </button>
        }
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Issue</span>
          <select
            className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
            value={ticket.category}
            onChange={(e) => setTicket((t) => ({ ...t, category: e.target.value }))}
          >
            <option>Campaign issue</option>
            <option>Tracking issue</option>
            <option>Performance discrepancy</option>
            <option>Payment issue</option>
          </select>
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Description</span>
          <textarea
            rows={5}
            className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
            value={ticket.body}
            onChange={(e) => setTicket((t) => ({ ...t, body: e.target.value }))}
          />
        </label>
      </Modal>

      <Modal
        open={requestOpen}
        title="Request campaigns"
        onClose={() => setRequestOpen(false)}
        footer={
          <button
            type="button"
            disabled={saving || !campaignReq.trim()}
            className="rounded-[10px] bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={submitCampaignRequest}
          >
            {saving ? "Submitting…" : "Submit request"}
          </button>
        }
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Brands or markets</span>
          <textarea
            rows={5}
            className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
            value={campaignReq}
            onChange={(e) => setCampaignReq(e.target.value)}
          />
        </label>
      </Modal>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[120] rounded-[10px] bg-slate-900 px-3.5 py-2.5 text-xs text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
