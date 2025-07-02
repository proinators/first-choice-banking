"use client";

const transferMethods = ["NEFT", "RTGS", "IMPS"];
import { useEffect, useState } from "react";

export default function TransferPage() {
  const [step, setStep] = useState(1);
  const [ownAccounts, setOwnAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    from: "",
    to: "",
    ifsc: "",
    amount: "",
    method: transferMethods[0],
  });
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    const account_number = typeof window !== "undefined" ? window.localStorage.getItem("bank_account") : null;
    if (!account_number) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    
    fetch(`/api/summary?account_number=${account_number}`)
      .then(res => res.json())
      .then(data => {
        const accounts = (data.accounts || []).map(acc => ({
          value: acc.number,
          label: `${acc.type} (${acc.number})`
        }));
        setOwnAccounts(accounts);
        if (accounts.length > 0) {
          setForm(f => ({ ...f, from: accounts[0].value }));
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load accounts");
        setLoading(false);
      });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.to.match(/^\d{10}$/)) {
      setError("Recipient Account Number must be 10 digits.");
      return;
    }
    if (!form.ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
      setError("Invalid IFSC code format.");
      return;
    }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setStep(2);
  }

  function confirmTransfer() {
    // Simulate transfer and generate reference number
    setReference("TXN" + Math.floor(Math.random() * 1000000000));
    setStep(3);
  }

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-center text-xl">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-8 text-center text-red-600 text-xl">{error}</div>;
  if (ownAccounts.length === 0) return <div className="max-w-2xl mx-auto p-8 text-center text-xl">No accounts found</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-900 tracking-tight drop-shadow-lg">Transfer Money</h1>
      {step === 1 && (
        <form className="glass-card space-y-8 p-10 shadow-2xl" onSubmit={handleSubmit}>
          <div>
            <label className="label-strong">From Account</label>
            <select
              name="from"
              className="w-full input-strong"
              value={form.from}
              onChange={handleChange}
            >
              {ownAccounts.map((acc) => (
                <option key={acc.value} value={acc.value}>{acc.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-strong">To Account Number</label>
            <input
              type="text"
              name="to"
              maxLength={10}
              className="w-full input-strong"
              value={form.to}
              onChange={handleChange}
              required
              placeholder="10 digit Account Number"
            />
          </div>
          <div>
            <label className="label-strong">Recipient IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              className="w-full input-strong uppercase"
              value={form.ifsc}
              onChange={handleChange}
              required
              placeholder="e.g. ABCD0123456"
            />
          </div>
          <div>
            <label className="label-strong">Amount (INR)</label>
            <input
              type="number"
              name="amount"
              className="w-full input-strong"
              value={form.amount}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              placeholder="Amount"
            />
          </div>
          <div>
            <label className="label-strong">Transfer Method</label>
            <select
              name="method"
              className="w-full input-strong"
              value={form.method}
              onChange={handleChange}
            >
              {transferMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button type="submit" className="w-full button-main">Continue</button>
        </form>
      )}
      {step === 2 && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Confirm Transfer Details</h2>
          <div className="mb-2"><span className="font-semibold">From:</span> {form.from}</div>
          <div className="mb-2"><span className="font-semibold">To:</span> {form.to}</div>
          <div className="mb-2"><span className="font-semibold">IFSC:</span> {form.ifsc}</div>
          <div className="mb-2"><span className="font-semibold">Amount:</span> ₹{Number(form.amount).toLocaleString()}</div>
          <div className="mb-2"><span className="font-semibold">Method:</span> {form.method}</div>
          <div className="flex gap-4 mt-6">
            <button className="button-main" onClick={confirmTransfer}>Confirm & Transfer</button>
            <button className="button-main" onClick={() => setStep(1)}>Edit</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-4 text-green-700">Transfer Successful!</h2>
          <div className="mb-2">Reference Number: <span className="font-mono">{reference}</span></div>
          <div className="mb-2">A confirmation email has been sent to your registered email address.</div>
          <button className="w-full button-main" onClick={() => setStep(1)}>Make Another Transfer</button>
        </div>
      )}
    </div>
  );
}
