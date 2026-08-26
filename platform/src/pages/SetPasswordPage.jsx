import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchApi, postApi } from "../api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/FormControls";

export function SetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Missing invitation token.");
      return;
    }
    setLoading(true);
    fetchApi(`/auth/invite/${encodeURIComponent(token)}`)
      .then((response) => setInvite(response.data ?? response))
      .catch((err) => setError(err.message || "Invalid invitation."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await postApi("/auth/set-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Could not set password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Set your password</h1>
        <p className="mt-2 text-sm text-slate-500">
          {invite?.clientName
            ? `Activate your portal access for ${invite.clientName}.`
            : "Complete your client portal invitation."}
        </p>

        {loading ? <p className="mt-6 text-sm text-slate-500">Validating invitation…</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {success ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Password saved. Redirecting to login…
          </p>
        ) : null}

        {!loading && !error && invite && !success ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-slate-700">
              Signed invitation for <strong>{invite.email}</strong>
            </p>
            <Input
              label="New password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm password"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button variant="primary" loading={submitting} className="w-full">
              Set password
            </Button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
