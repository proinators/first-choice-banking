"use client";
import { useState } from "react";

const transactionsData = [
  {
    id: 1,
    date: "2025-07-01",
    amount: -2500,
    type: "Debit",
    status: "Completed",
    description: "Grocery Store",
    account: "1234567890",
  },
  {
    id: 2,
    date: "2025-06-29",
    amount: 5000,
    type: "Credit",
    status: "Completed",
    description: "Salary",
    account: "1234567890",
  },
  {
    id: 3,
    date: "2025-06-28",
    amount: -1200,
    type: "Debit",
    status: "Pending",
    description: "Electricity Bill",
    account: "9876543210",
  },
  {
    id: 4,
    date: "2025-06-25",
    amount: -3000,
    type: "Debit",
    status: "Completed",
    description: "Online Shopping",
    account: "1234567890",
  },
  {
    id: 5,
    date: "2025-06-20",
    amount: 10000,
    type: "Credit",
    status: "Completed",
    description: "FD Maturity",
    account: "9876543210",
  },
];

const transactionTypes = ["All", "Credit", "Debit"];
const statusTypes = ["All", "Completed", "Pending"];

function downloadCSV(transactions) {
  const header = "Date,Account,Type,Amount,Status,Description\n";
  const rows = transactions
    .map(
      (t) =>
        `${t.date},${t.account},${t.type},${t.amount},${t.status},"${t.description.replace(/\"/g, '"')}"`
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

  const filtered = transactionsData.filter((t) => {
    return (
      (typeFilter === "All" || t.type === typeFilter) &&
      (statusFilter === "All" || t.status === statusFilter) &&
      (!dateFilter || t.date === dateFilter)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Recent Transactions</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border px-2 py-1 rounded"
          value={ typeFilter }
          onChange={ (e) => setTypeFilter(e.target.value) }
        >
          { transactionTypes.map((type) => (
            <option key={ type }>{ type }</option>
          )) }
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={ statusFilter }
          onChange={ (e) => setStatusFilter(e.target.value) }
        >
          { statusTypes.map((s) => (
            <option key={ s }>{ s }</option>
          )) }
        </select>
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={ dateFilter }
          onChange={ (e) => setDateFilter(e.target.value) }
        />
        <button
          className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800"
          onClick={ () => downloadCSV(filtered) }
        >
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-100 text-blue-700">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Account</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            { filtered.length === 0 && (
              <tr>
                <td colSpan={ 6 } className="text-center py-6 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) }
            { filtered.map((t) => (
              <>
                <tr key={ t.id } className="hover:bg-blue-50">
                  <td className="py-2 px-4">{ t.date }</td>
                  <td className="py-2 px-4">{ t.account }</td>
                  <td className="py-2 px-4">{ t.type }</td>
                  <td className={ `py-2 px-4 font-bold ${t.amount < 0 ? "text-red-600" : "text-green-700"}` }>
                    { t.amount < 0 ? "-" : "+" }₹{ Math.abs(t.amount).toLocaleString() }
                  </td>
                  <td className="py-2 px-4">{ t.status }</td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-700 underline text-sm"
                      onClick={ () => setExpanded(expanded === t.id ? null : t.id) }
                    >
                      { expanded === t.id ? "Hide" : "View" }
                    </button>
                  </td>
                </tr>
                { expanded === t.id && (
                  <tr className="bg-blue-50" key={ t.id + "-details" }>
                    <td colSpan={ 6 } className="p-4 text-sm text-gray-700">
                      <div><span className="font-semibold">Description:</span> { t.description }</div>
                      <div><span className="font-semibold">Transaction ID:</span> { t.id }</div>
                      <div><span className="font-semibold">Status:</span> { t.status }</div>
                    </td>
                  </tr>
                ) }
              </>
            )) }
          </tbody>
        </table>
      </div>
    </div>
  );
}

