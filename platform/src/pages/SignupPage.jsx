import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postApi } from "../api";
import { PLATFORM_NAME } from "../config/brand";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const FEATURES = [
  "Unified campaign catalog",
  "Real-time tracking",
  "Fully white-label",
];

function SignupPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [sendOtpError, setSendOtpError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (otp.length !== 6) {
      setIsOtpVerified(false);
      setVerificationToken("");
      setOtpError("");
      setPassword("");
      return;
    }

    let cancelled = false;

    async function verifyOtp() {
      if (!email.trim()) {
        setOtpError("Enter your email first.");
        setIsOtpVerified(false);
        return;
      }

      setIsVerifyingOtp(true);
      setOtpError("");

      try {
        const response = await postApi("/auth/verify-otp", { email: email.trim(), otp });
        if (!cancelled) {
          setIsOtpVerified(true);
          setVerificationToken(response.verificationToken || "");
        }
      } catch (err) {
        if (!cancelled) {
          setIsOtpVerified(false);
          setVerificationToken("");
          setPassword("");
          setOtpError(err.message || "Invalid OTP. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsVerifyingOtp(false);
        }
      }
    }

    verifyOtp();

    return () => {
      cancelled = true;
    };
  }, [otp, email]);

  function resetOtpState() {
    setOtp("");
    setPassword("");
    setVerificationToken("");
    setIsOtpVerified(false);
    setOtpSent(false);
    setOtpError("");
    setSendOtpError("");
    setSubmitError("");
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    resetOtpState();
  }

  function handleOtpChange(event) {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
  }

  async function handleSendOtp() {
    if (!email.trim()) {
      setSendOtpError("Enter your email first.");
      return;
    }

    setIsSendingOtp(true);
    setSendOtpError("");
    setOtp("");
    setPassword("");
    setVerificationToken("");
    setIsOtpVerified(false);
    setOtpError("");
    setSubmitError("");

    try {
      await postApi("/auth/send-otp", { email: email.trim() });
      setOtpSent(true);
    } catch (err) {
      setSendOtpError(err.message || "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isOtpVerified || !verificationToken || !password) {
      return;
    }

    setIsCreatingAccount(true);
    setSubmitError("");

    try {
      await register({
        email: email.trim(),
        password,
        verificationToken,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Signup failed.");
    } finally {
      setIsCreatingAccount(false);
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
            <span className="section-label block text-[#c9a227]">Get Started</span>
            <h1
              className="login-heading mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              Infrastructure for affiliate commerce across fintech platforms.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">
              Create your account to access campaigns, track performance, and monitor commissions
              from one unified workspace.
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
              <span className="section-label text-[#c9a227]">Sign Up</span>
              <h2
                className="login-heading mt-3 text-2xl font-extrabold tracking-tight md:text-3xl"
                style={{ color: "#0d1b3e", letterSpacing: "-0.025em" }}
              >
                Create your account
              </h2>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: "#0d1b3e" }}>
                    Email
                  </span>
                  <div className="flex gap-2">
                    <input
                      className="login-input w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition"
                      onChange={handleEmailChange}
                      placeholder="name@company.com"
                      style={{ borderColor: "#edf0f7", color: "#0d1b3e" }}
                      type="email"
                      value={email}
                    />
                    <button
                      className="login-btn login-heading shrink-0 rounded-lg px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSendingOtp || !email.trim()}
                      onClick={handleSendOtp}
                      style={{ color: "#0d1b3e" }}
                      type="button"
                    >
                      {isSendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                    </button>
                  </div>
                  {sendOtpError && <p className="mt-1.5 text-xs text-red-500">{sendOtpError}</p>}
                  {otpSent && !sendOtpError && (
                    <p className="mt-1.5 text-xs" style={{ color: "#64748b" }}>
                      Verification code sent. Check your inbox.
                    </p>
                  )}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium" style={{ color: "#0d1b3e" }}>
                    OTP
                  </span>
                  <input
                    className="login-input w-full rounded-lg border bg-white px-4 py-3 text-sm tracking-[0.3em] outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50"
                    disabled={!otpSent}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    style={{
                      borderColor: otpError ? "#f87171" : "#edf0f7",
                      color: "#0d1b3e",
                    }}
                    type="text"
                    value={otp}
                  />
                  {isVerifyingOtp && (
                    <p className="mt-1.5 text-xs" style={{ color: "#64748b" }}>
                      Verifying OTP...
                    </p>
                  )}
                  {otpError && !isVerifyingOtp && (
                    <p className="mt-1.5 text-xs text-red-500">{otpError}</p>
                  )}
                  {isOtpVerified && !isVerifyingOtp && (
                    <p className="mt-1.5 text-xs" style={{ color: "#c9a227" }}>
                      OTP verified. Set your password below.
                    </p>
                  )}
                </label>
                {isOtpVerified && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: "#0d1b3e" }}>
                      Set Password
                    </span>
                    <input
                      className="login-input w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition"
                      minLength={8}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create your password"
                      style={{ borderColor: "#edf0f7", color: "#0d1b3e" }}
                      type="password"
                      value={password}
                    />
                  </label>
                )}
                {submitError && <p className="text-xs text-red-500">{submitError}</p>}
                <button
                  className="login-btn login-heading w-full rounded-lg px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isOtpVerified || !password || isCreatingAccount}
                  style={{ color: "#0d1b3e" }}
                  type="submit"
                >
                  {isCreatingAccount ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-sm" style={{ color: "#64748b" }}>
                Already have an account?{" "}
                <Link
                  className="font-semibold transition hover:opacity-80"
                  style={{ color: "#c9a227" }}
                  to="/login"
                >
                  Log in
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

export { SignupPage };
