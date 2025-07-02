"use client";
import { useState, useEffect } from "react";
import React from "react";
const transactionTypes = ["All", "Credit", "Debit"];
const statusTypes = ["All", "Completed", "Pending"];

function downloadCSV(transactions) {
  const header = "Date,Account,Type,Amount,Status,Description\n";
  const rows = (transactions || [])
    .map(
      (t) =>
        `${t.date},${t.account},${t.type},${t.amount},${t.status},"${(t.description || '').replace(/\"/g, '"')}"`
    )
    .join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const account_number = typeof window !== "undefined" ? window.localStorage.getItem("bank_account") : null;
    if (!account_number) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    setLoading(true);
    let url = `/api/transactions?account_number=${account_number}`;
    if (typeFilter && typeFilter !== 'All') url += `&type=${typeFilter}`;
    if (statusFilter && statusFilter !== 'All') url += `&status=${statusFilter}`;
    if (dateFilter) url += `&date=${dateFilter}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch transactions");
        setLoading(false);
      });
  }, [typeFilter, statusFilter, dateFilter]);

  if (loading) return <div className="max-w-5xl mx-auto p-8 text-center text-xl">Loading...</div>;
  if (error) return <div className="max-w-5xl mx-auto p-8 text-center text-red-600 text-xl">{ error }</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-900 tracking-tight drop-shadow-lg">Recent Transactions</h1>
      <div className="glass-card mb-10 px-8 py-6 flex flex-wrap gap-6 items-center justify-center shadow-xl">
        <select
          className="input-strong w-48"
          value={ typeFilter }
          onChange={ (e) => setTypeFilter(e.target.value) }
        >
          { transactionTypes.map((type) => (
            <option key={ type }>{ type }</option>
          )) }
        </select>
        <select
          className="input-strong w-48"
          value={ statusFilter }
          onChange={ (e) => setStatusFilter(e.target.value) }
        >
          { statusTypes.map((s) => (
            <option key={ s }>{ s }</option>
          )) }
        </select>
        <input
          type="date"
          className="input-strong w-48"
          value={ dateFilter }
          onChange={ (e) => setDateFilter(e.target.value) }
        />
        <button
          className="button-main"
          onClick={ () => downloadCSV(transactions) }
        >
          Download CSV
        </button>
      </div>
      <div className="glass-card overflow-x-auto rounded-2xl shadow-2xl">
        <table className="min-w-full text-lg">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100/80 to-blue-200/70 text-blue-800">
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Account</th>
              <th className="py-4 px-6">Type</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Details</th>
            </tr>
          </thead>
          <tbody>
            { transactions.length === 0 && (
              <tr>
                <td colSpan={ 6 } className="text-center py-8 text-gray-400 text-xl">
                  No transactions found.
                </td>
              </tr>
            ) }
            { transactions.map((t) => (
              <React.Fragment key={ t.id }>
                <tr key={ t.id } className="hover:bg-blue-100/60 transition-colors">
                  <td className="py-2 px-4">{ t.date }</td>
                  <td className="py-2 px-4">{ t.account }</td>
                  <td className="py-2 px-4">{ t.type }</td>
                  <td className="py-2 px-4">{ t.amount }</td>
                  <td className="py-2 px-4">{ t.status }</td>
                  <td className="py-2 px-4">
                    <button
                      className="underline text-blue-700 hover:text-blue-900"
                      onClick={ () => setExpanded(expanded === t.id ? null : t.id) }
                    >
                      { expanded === t.id ? "Hide" : "Details" }
                    </button>
                  </td>
                </tr>
                { expanded === t.id && (
                  <tr className="bg-blue-50/80" key={ t.id + "-details" }>
                    <td colSpan={ 6 } className="p-6 text-lg text-blue-900/90">
                      <div><span className="font-semibold">Description:</span> { t.description }</div>
                      <div><span className="font-semibold">Transaction ID:</span> { t.id }</div>
                      <div><span className="font-semibold">Status:</span> { t.status }</div>
                    </td>
                  </tr>
                ) }
              </React.Fragment>
            )) }
          </tbody>
        </table>
      </div>
    </div>
  );
}

