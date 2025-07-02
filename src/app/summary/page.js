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
                {acc.currency} {acc.balance.toLocaleString()}
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
        <div className="glass-card p-8 flex flex-col gap-4 shadow-xl">
          <div className="font-semibold text-blue-800 text-xl">{creditCard.type}</div>
          <div className="text-base text-blue-500 font-mono">Card No: {creditCard.number}</div>
          <div className="text-lg">Available Credit: <span className="font-bold text-green-700">{creditCard.currency} {creditCard.availableCredit.toLocaleString()}</span> / <span className="text-blue-900">{creditCard.currency} {creditCard.limit.toLocaleString()}</span></div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Fixed Deposits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fixedDeposits.map((fd) => (
            <div key={fd.id} className="glass-card p-8 flex flex-col gap-2 shadow-xl">
              <div className="font-semibold text-blue-800 text-xl">FD #{fd.id}</div>
              <div className="text-base">Amount: <span className="font-bold text-blue-900">{fd.currency} {fd.amount.toLocaleString()}</span></div>
              <div className="text-base">Maturity: <span className="font-semibold">{fd.maturityDate}</span></div>
              <div className="text-base">Interest: <span className="text-green-700 font-semibold">{fd.interest}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

