"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const loggedIn = typeof window !== "undefined" && window.localStorage.getItem("bank_logged_in") === "true";
    // Allow login page always
    if (!loggedIn && pathname !== "/login") {
      router.replace("/login");
    }
    setChecked(true);
  }, [pathname, router]);

  // Prevent flicker
  if (!checked) return null;
  return children;
}
