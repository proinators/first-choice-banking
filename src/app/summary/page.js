import Link from "next/link";

const accounts = [
  {
    type: "Checking Account",
    number: "1234567890",
    balance: 25400.75,
    currency: "INR",
  },
  {
    type: "Savings Account",
    number: "9876543210",
    balance: 102340.25,
    currency: "INR",
  },
];

const creditCard = {
  type: "Credit Card",
  number: "4321 5678 9876 1234",
  availableCredit: 80000,
  limit: 100000,
  currency: "INR",
};

const fixedDeposits = [
  {
    id: "FD001",
    amount: 50000,
    maturityDate: "2026-01-01",
    interest: "6.5%",
    currency: "INR",
  },
  {
    id: "FD002",
    amount: 75000,
    maturityDate: "2027-03-15",
    interest: "7.0%",
    currency: "INR",
  },
];

export default function SummaryPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Account Summary</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.number} className="bg-white rounded shadow p-4">
              <div className="font-semibold text-blue-700">{acc.type}</div>
              <div className="text-sm text-gray-500">Account No: {acc.number}</div>
              <div className="mt-2 text-lg font-bold">
                {acc.currency} {acc.balance.toLocaleString()}
              </div>
              <div className="flex gap-2 mt-4">
                <Link href="/transactions" className="text-blue-600 underline text-sm">View Transactions</Link>
                <Link href="/transfer" className="text-blue-600 underline text-sm">Transfer Money</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Credit Card</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700">{creditCard.type}</div>
          <div className="text-sm text-gray-500">Card No: {creditCard.number}</div>
          <div className="text-sm">Available Credit: <span className="font-bold">{creditCard.currency} {creditCard.availableCredit.toLocaleString()}</span> / {creditCard.currency} {creditCard.limit.toLocaleString()}</div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Fixed Deposits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixedDeposits.map((fd) => (
            <div key={fd.id} className="bg-white rounded shadow p-4">
              <div className="font-semibold text-blue-700">FD #{fd.id}</div>
              <div className="text-sm">Amount: {fd.currency} {fd.amount.toLocaleString()}</div>
              <div className="text-sm">Maturity: {fd.maturityDate}</div>
              <div className="text-sm">Interest: {fd.interest}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

