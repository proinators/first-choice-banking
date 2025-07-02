"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const router = useRouter();

  function generateCaptcha() {
    // Simple math captcha
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { q: `${a} + ${b} = ?`, ans: (a + b).toString() };
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (locked) {
      setError("Account is locked. Please reset your password to unlock.");
      return;
    }
    if (account.length !== 10 || !/^[0-9]{10}$/.test(account)) {
      setError("Account number must be 10 digits.");
      return;
    }
    if (captchaInput !== captcha.ans) {
      setError("Incorrect CAPTCHA answer.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password })
      });
      console.log(res);
      const data = await res.json();
      if (!res.ok) {
        setFailedAttempts(failedAttempts + 1);
        if (failedAttempts + 1 >= 3) {
          setLocked(true);
          setError("Account locked after 3 failed attempts. Reset password to unlock.");
        } else {
          setError(data.error || "Invalid account number or password.");
        }
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        return;
      }
      // Save session and redirect
      if (typeof window !== "undefined") {
        window.localStorage.setItem("bank_logged_in", "true");
        window.localStorage.setItem("bank_account", account);
      }
      router.push("/summary");
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };


  const handleReset = (e) => {
    e.preventDefault();
    // Simulate email verification
    if (email) {
      setResetSent(true);
      setTimeout(() => {
        setShowReset(false);
        setResetSent(false);
        setEmail("");
        setLocked(false);
        setFailedAttempts(0);
        setError("");
      }, 2000);
    }
  };

  // 2FA/OTP is not implemented in backend. Remove this logic.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg glass-card p-10 shadow-2xl flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-900 drop-shadow-lg tracking-tight" style={{letterSpacing:'.01em'}}>FirstChoice Bank Login</h1>
        {showReset ? (
          <form onSubmit={handleReset} className="space-y-4">
            <label className="label-strong">Enter your email to reset password:</label>
            <input
              type="email"
              className="w-full input-strong"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full button-main">Send Reset Link</button>
            {resetSent && <div className="text-green-600 text-center mt-2">Reset link sent! Account unlocked.</div>}
            <button type="button" onClick={() => setShowReset(false)} className="w-full mt-2 text-blue-700 underline">Back to Login</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-strong">Account Number</label>
              <input
                type="text"
                maxLength={10}
                className="w-full input-strong"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="10 digit Account Number"
                disabled={locked}
              />
            </div>
            <div>
              <label className="label-strong">Password</label>
              <input
                type="password"
                className="w-full input-strong"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                disabled={locked}
              />
            </div>
            <div>
              <label className="label-strong">CAPTCHA: <span className="font-mono">{captcha.q}</span></label>
              <input
                type="text"
                className="w-full input-strong"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                placeholder="Answer"
                disabled={locked}
              />
            </div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            <button type="submit" className="w-full button-main" disabled={locked}>Login</button>
            <button type="button" onClick={() => setShowReset(true)} className="w-full text-blue-700 underline font-semibold">Forgot Password?</button>
          </form>
        )}
      </div>
    </div>
  );
}
