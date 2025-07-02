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

  // Hardcoded credentials
  const validAccount = "1234567890";
  const validPassword = "password123";
  const validOTP = "123456";

  function generateCaptcha() {
    // Simple math captcha
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { q: `${a} + ${b} = ?`, ans: (a + b).toString() };
  }

  const handleLogin = (e) => {
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
    if (account === validAccount && password === validPassword) {
      setShow2FA(true);
      setOtp(validOTP); // Simulate sending OTP
      setError("");
    } else {
      setFailedAttempts(failedAttempts + 1);
      if (failedAttempts + 1 >= 3) {
        setLocked(true);
        setError("Account locked after 3 failed attempts. Reset password to unlock.");
      } else {
        setError(`Invalid account number or password. Attempts left: ${2 - failedAttempts}`);
      }
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
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

  const handle2FA = (e) => {
    e.preventDefault();
    setOtpError("");
    if (otpInput === otp) {
      // Simulate login session
      if (typeof window !== "undefined") {
        window.localStorage.setItem("bank_logged_in", "true");
        window.localStorage.setItem("bank_account", account);
      }
      router.push("/summary");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">FirstChoice Bank Login</h1>
        {showReset ? (
          <form onSubmit={handleReset} className="space-y-4">
            <label className="block text-gray-700">Enter your email to reset password:</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">Send Reset Link</button>
            {resetSent && <div className="text-green-600 text-center mt-2">Reset link sent! Account unlocked.</div>}
            <button type="button" onClick={() => setShowReset(false)} className="w-full mt-2 text-blue-700 underline">Back to Login</button>
          </form>
        ) : show2FA ? (
          <form onSubmit={handle2FA} className="space-y-4">
            <div className="text-center text-blue-700 font-semibold">Enter the OTP sent to your registered email (demo: <span className='font-mono'>123456</span>)</div>
            <input
              type="text"
              maxLength={6}
              className="w-full border rounded px-3 py-2 text-center tracking-widest font-mono"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              required
              placeholder="Enter 6-digit OTP"
            />
            {otpError && <div className="text-red-600 text-center">{otpError}</div>}
            <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">Verify & Login</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700">Account Number</label>
              <input
                type="text"
                maxLength={10}
                className="w-full border rounded px-3 py-2"
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
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-gray-700">CAPTCHA: <span className="font-mono">{captcha.q}</span></label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                placeholder="Answer"
                disabled={locked}
              />
            </div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800" disabled={locked}>Login</button>
            <button type="button" onClick={() => setShowReset(true)} className="w-full text-blue-700 underline">Forgot Password?</button>
          </form>
        )}
      </div>
    </div>
  );
}
