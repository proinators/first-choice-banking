"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setAccounts(data.accounts || []);
        setCreditCards(data.credit_cards || []);
        setFixedDeposits(data.fixed_deposits || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch summary");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto p-8 text-center text-xl">Loading...</div>;
  if (error) return <div className="max-w-5xl mx-auto p-8 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-900 tracking-tight drop-shadow-lg">Account Summary</h1>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {accounts.map((acc) => (
            <div key={acc.number} className="glass-card p-8 flex flex-col gap-4 shadow-xl">
              <div className="font-semibold text-blue-800 text-xl">{acc.type}</div>
              <div className="text-base text-blue-500 font-mono">Account No: {acc.number}</div>
              <div className="mt-2 text-3xl font-extrabold text-blue-900">
                {acc.currency} {Number(acc.balance).toLocaleString()}
              </div>
              <div className="flex gap-4 mt-4">
                <Link href="/transactions" className="button-main text-base">View Transactions</Link>
                <Link href="/transfer" className="button-main text-base">Transfer Money</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Credit Card</h2>
        {creditCards.length === 0 ? <div className="text-gray-500">No credit cards found.</div> : (
          creditCards.map((card) => (
            <div key={card.number} className="glass-card p-8 flex flex-col gap-4 shadow-xl">
              <div className="font-semibold text-blue-800 text-xl">Credit Card</div>
              <div className="text-base text-blue-500 font-mono">Card No: {card.number}</div>
              <div className="text-lg">Available Credit: <span className="font-bold text-green-700">{card.currency} {Number(card.availableCredit).toLocaleString()}</span> / <span className="text-blue-900">{card.currency} {Number(card.limits).toLocaleString()}</span></div>
            </div>
          ))
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Fixed Deposits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fixedDeposits.map((fd) => (
            <div key={fd.id} className="glass-card p-8 flex flex-col gap-2 shadow-xl">
              <div className="font-semibold text-blue-800 text-xl">FD #{fd.id}</div>
              <div className="text-base">Amount: <span className="font-bold text-blue-900">{fd.currency} {Number(fd.amount).toLocaleString()}</span></div>
              <div className="text-base">Maturity: <span className="font-semibold">{fd.maturityDate}</span></div>
              <div className="text-base">Interest: <span className="text-green-700 font-semibold">{fd.interest}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
