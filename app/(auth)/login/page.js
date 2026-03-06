"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     📱 FORMAT PHONE AUTO
  ========================= */
  const formatInput = (value) => {
    if (/^\d+$/.test(value)) {
      const digits = value.replace(/\D/g, "");
      return digits.slice(0, 10);
    }
    return value;
  };

  /* =========================
     🔐 LOGIN USER
  ========================= */
  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      alert("Please enter email/phone and password");
      return;
    }

    try {
      setLoading(true);

      let payloadValue = emailOrPhone.trim();

      // add country code automatically
      if (/^\d{10}$/.test(payloadValue)) {
        payloadValue = "91" + payloadValue;
      }

      const res = await fetch(
        "https://utsavas-backend-1.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone: payloadValue,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful ✅");
        router.push("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <Image
          src="/utsavas-logo.png"
          alt="UTSAVAS Logo"
          width={120}
          height={120}
          className={styles.logoImage}
        />

        <h1 className={styles.logo}>UTSAVAS</h1>
        <p className={styles.tagline}>Where UTSAVAS Become Memories</p>

        {/* Email or Phone */}
        <input
          type="text"
          placeholder="Email or Phone Number"
          className={styles.inputField}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(formatInput(e.target.value))}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.registerText}>
          Don’t have an account?{" "}
          <span onClick={() => router.push("/register")}>
            Register
          </span>
        </p>

        <p
          style={{ cursor: "pointer", color: "#e6c068" }}
          onClick={() => router.push("/forgot-password")}
        >
          Forgot Password?
        </p>

        <button
          className={styles.vendorBtn}
          onClick={() => router.push("/vendor-register")}
        >
          Register as Vendor
        </button>

        <button
          className={styles.vendorBtn}
          onClick={() => router.push("/vendor/vendor-login")}
        >
          Login as Vendor
        </button>
      </div>
    </div>
  );
}