"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./vendorLogin.module.css";

export default function VendorLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert("Please enter email or phone and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/vendor/login", {
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

      // ✅ success
      localStorage.setItem("vendor", JSON.stringify(data.vendor));
      alert("Vendor login successful!");
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
      <div className={styles.card}>
        <h1 className={styles.title}>Vendor Login</h1>

        <input
          className={styles.input}
          placeholder="Email or Phone Number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          className={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={styles.submitBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className={styles.backText}
          onClick={() => router.push("/vendor-register")}
        >
          New vendor? Register →
        </p>
      </div>
    </div>
  );
}
