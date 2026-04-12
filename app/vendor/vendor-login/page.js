"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./vendorLogin.module.css";
import VendorPlansInfo from "../../components/VendorPlansInfo";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function VendorLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event?.preventDefault();

    if (!identifier || !password) {
      alert("Please enter email or phone and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/vendor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        alert(data?.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("vendorToken", data.token);
      localStorage.setItem("vendor", JSON.stringify(data.vendor));
      router.push("/vendor/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            <Link href="/" className={styles.titleLink}>
              Vendor Login
            </Link>
          </h1>

          <form className={styles.form} onSubmit={handleLogin}>
            <input
              className={styles.input}
              placeholder="Email or Phone Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />

            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.helperRow}>
            <Link href="/vendor/forgot-password" className={styles.helperLink}>
              Forgot Password?
            </Link>
          </div>

          <p
            className={styles.backText}
            onClick={() => router.push("/vendor-register")}
          >
            New vendor? Register
          </p>
        </div>

        <VendorPlansInfo
          title="Vendor listing plans"
          intro="Review the listing plans and platform commission before logging in to manage your venue with UTSAVAS."
        />
      </div>
    </div>
  );
}
