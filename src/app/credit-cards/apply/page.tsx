"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBanking } from "@/context/BankingContext";
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function ApplyCreditCardPage() {
  const router = useRouter();
  const { user, addCreditCard } = useBanking();

  const [form, setForm] = useState({
    name: "",
    type: "Standard",
    creditLimit: 50000,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    if (user?.user_metadata.full_name) {
      setForm((prev) => ({ ...prev, name: user.user_metadata.full_name }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "creditLimit" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.creditLimit < 10000) {
      setError("Minimum credit limit is ₹10,000");
      return;
    }

    setIsSubmitting(true);

    try {
      const newCard = await addCreditCard({
        name: form.name,
        type: form.type,
        creditLimit: form.creditLimit,
      });

      if (newCard) {
        setCardNumber(newCard.number);
        setSuccess(true);
      } else {
        setError("Failed to apply for credit card. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#031d44] to-[#04395e] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg w-full max-w-lg p-8">
        {!success ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCardIcon className="h-7 w-7 text-[#66c3ff]" /> Apply for Credit
              Card
            </h2>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 p-3 rounded mb-4">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Card Holder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Card Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                >
                  <option value="Standard">Standard</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Desired Credit Limit (₹)
                </label>
                <input
                  type="number"
                  name="creditLimit"
                  value={form.creditLimit}
                  onChange={handleInputChange}
                  min="10000"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                  required
                />
                <p className="text-xs text-blue-200 mt-1">Minimum limit: ₹10,000</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#031d44] bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Apply Now"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white mt-4">
              Application Successful!
            </h3>
            <p className="text-blue-100 mt-2">
              Your new credit card (number {cardNumber}) has been created and will
              be shipped to your registered address shortly.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 px-5 py-2 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
