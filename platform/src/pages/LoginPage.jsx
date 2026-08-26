import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PLATFORM_NAME } from "../config/brand";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const FEATURES = [
  "Unified campaign catalog",
  "Real-time tracking",
  "Fully white-label",
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // AuthContext user may not be in LoginPage yet; default path handles CLIENT via ProtectedRoute.
      navigate(location.state?.from || "/", { replace: true });
    }
  }, [isAuthenticated, location.state?.from, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ email: email.trim(), password });
      const dest =
        response?.user?.role === "CLIENT"
          ? "/portal"
          : location.state?.from || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="login-page relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)",
      }}
    >
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="gold-line absolute left-0 right-0 top-0" />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 85% 0%, rgba(168,207,240,0.18) 0%, rgba(74,132,196,0.1) 35%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-6 md:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="hidden lg:block">
            <img
              alt={PLATFORM_NAME}
              className="mb-6 h-12 w-auto"
              src={`${import.meta.env.BASE_URL}mbo-logo.svg`}
            />
            <span className="section-label block text-[#c9a227]">Platform Access</span>
            <h1
              className="login-heading mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              Infrastructure for affiliate commerce across fintech platforms.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">
              Sign in to manage campaigns, track performance, and monitor commissions from one
              unified workspace.
            </p>
            <p className="mt-2 text-xs font-semibold text-white/30">
              One API. Every campaign. Full tracking.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div
                    className="h-[5px] w-[5px] shrink-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #e8c55a, #c9a227)",
                    }}
                  />
                  <span className="text-sm text-white/55">{feature}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-6 max-w-sm overflow-hidden rounded-lg border"
              style={{
                borderColor: "rgba(201,162,39,0.15)",
                background: "#070e20",
              }}
            >
              <div
                className="flex gap-1 px-3 py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="h-[7px] w-[7px] rounded-full bg-[#3d3d3d]" />
                <div className="h-[7px] w-[7px] rounded-full bg-[#3d3d3d]" />
                <div className="h-[7px] w-[7px] rounded-full bg-[#3d3d3d]" />
              </div>
              <pre
                className="m-0 overflow-x-auto px-4 py-3 font-mono text-[10px] leading-snug"
                style={{ color: "#cdd6f4" }}
              >
                <code>{`{
  "campaign": "Travel Offer",
  "cashback": "8%",
  "tracking_id": "txn_12345"
}`}</code>
              </pre>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div className="mb-6 flex justify-center lg:hidden">
              <img
                alt={PLATFORM_NAME}
                className="h-14 w-auto"
                src={`${import.meta.env.BASE_URL}mbo-logo.svg`}
              />
            </div>

            <div
              className="rounded-2xl border bg-white p-8 shadow-2xl md:p-10"
              style={{ borderColor: "#edf0f7" }}
            >
              <span className="section-label text-[#c9a227]">Sign In</span>
              <h2
                className="login-heading mt-3 text-2xl font-extrabold tracking-tight md:text-3xl"
                style={{ color: "#0d1b3e", letterSpacing: "-0.025em" }}
              >
                Log in to your account
              </h2>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: "#0d1b3e" }}>
                    Email
                  </span>
                  <input
                    required
                    autoComplete="email"
                    className="login-input w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    style={{ borderColor: "#edf0f7", color: "#0d1b3e" }}
                    type="email"
                    value={email}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: "#0d1b3e" }}>
                    Password
                  </span>
                  <input
                    required
                    autoComplete="current-password"
                    className="login-input w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    style={{ borderColor: "#edf0f7", color: "#0d1b3e" }}
                    type="password"
                    value={password}
                  />
                </label>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  className="login-btn login-heading w-full rounded-lg px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || !email.trim() || !password}
                  style={{ color: "#0d1b3e" }}
                  type="submit"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-6 text-sm" style={{ color: "#64748b" }}>
                New to {PLATFORM_NAME}?{" "}
                <Link
                  className="font-semibold transition hover:opacity-80"
                  style={{ color: "#c9a227" }}
                  to="/signup"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Data hosted in India · RBI-aligned infrastructure
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export { LoginPage };
