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

  const getQueryParam = (key) => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  const getRedirectPath = () => {
    const redirect = getQueryParam("redirect");
    if (redirect && redirect.startsWith("/")) return redirect;
    return "/dashboard";
  };

  const formatInput = (value) => {
    if (/^\d+$/.test(value)) {
      const digits = value.replace(/\D/g, "");
      return digits.slice(0, 10);
    }
    return value;
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      alert("Please enter email/phone and password");
      return;
    }

    try {
      setLoading(true);

      let payloadValue = emailOrPhone.trim();

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
        const serverUser = data.user || {};
        let previousUser = {};
        try {
          previousUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          previousUser = {};
        }

        const normalizedUser = {
          ...previousUser,
          ...serverUser,
          firstName: serverUser.firstName || previousUser.firstName || "",
          lastName: serverUser.lastName || previousUser.lastName || "",
          name:
            serverUser.name ||
            previousUser.name ||
            `${serverUser.firstName || ""} ${serverUser.lastName || ""}`.trim(),
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        alert("Login successful");
        router.push(getRedirectPath());
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

        <input
          type="text"
          placeholder="Email or Phone Number"
          className={styles.inputField}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(formatInput(e.target.value))}
        />

        <input
          type="password"
          placeholder="Password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.registerText}>
          Don&apos;t have an account?{" "}
          <span
            onClick={() => {
              const redirect = getQueryParam("redirect");
              if (redirect && redirect.startsWith("/")) {
                router.push(`/register?redirect=${encodeURIComponent(redirect)}`);
                return;
              }
              router.push("/register");
            }}
          >
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
