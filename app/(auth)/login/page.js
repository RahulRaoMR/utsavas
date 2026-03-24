"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import styles from "./login.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { clearUserSession, sanitizeRedirectPath } from "../../../lib/authRedirect";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = sanitizeRedirectPath(
    searchParams.get("redirect"),
    "/dashboard"
  );

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          JSON.parse(storedUser);
        }

        const res = await fetch(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Stored session is invalid");
        }

        const data = await res.json();

        if (!data?.success || !data?.user) {
          throw new Error("Stored session is invalid");
        }

        localStorage.setItem("user", JSON.stringify(data.user));

        if (!cancelled) {
          router.replace(redirectPath);
        }
      } catch (error) {
        console.error("Stored user data is invalid:", error);
        clearUserSession();
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [redirectPath, router]);

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

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: payloadValue,
          password,
        }),
      });

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
        router.replace(redirectPath);
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
          src="/logo/utsavaa-gold.png"
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
              router.push(
                `/register?redirect=${encodeURIComponent(redirectPath)}`
              );
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.loginContainer}></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
