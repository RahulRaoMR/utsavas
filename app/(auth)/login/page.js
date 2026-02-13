"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Setup reCAPTCHA (FIXED VERSION)
  useEffect(() => {
  if (typeof window === "undefined") return;

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    window.recaptchaVerifier.render();
  }
}, []);

  // =========================
  // ✅ EMAIL LOGIN
  // =========================
  const handleEmailLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);

      localStorage.removeItem("enquiryFilled");

      alert("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  // =========================
  // 📲 SEND OTP
  // =========================
  const sendOTP = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP sent successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  // =========================
  // ✅ VERIFY OTP
  // =========================
  const verifyOTP = async () => {
    if (!confirmationResult) {
      alert("Please request OTP first");
      return;
    }

    try {
      await confirmationResult.confirm(otp);

      localStorage.removeItem("enquiryFilled");

      alert("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      alert("Invalid OTP");
    }
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
        <p className={styles.tagline}>
          Where UTSAVAS Become Memories
        </p>

        {!showOTPLogin ? (
          <>
            <input
              type="email"
              placeholder="Email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onClick={handleEmailLogin}
            >
              Login
            </button>

            <div className={styles.orText}>OR</div>

            <button
              className={styles.otpBtn}
              onClick={() => {
                setShowOTPLogin(true);
                setOtpSent(false);
              }}
            >
              Login with OTP
            </button>

            <p className={styles.registerText}>
              Don’t have an account?{" "}
              <span onClick={() => router.push("/register")}>
                Register
              </span>
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
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter Phone Number"
              className={styles.inputField}
              value={phone}
              onChange={(e) => {
                if (!e.target.value.startsWith("+91")) return;
                setPhone(e.target.value);
              }}
              disabled={otpSent}
            />

            {!otpSent && (
              <button
                className={styles.loginBtn}
                onClick={sendOTP}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            )}

            {otpSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className={styles.inputField}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  className={styles.loginBtn}
                  onClick={verifyOTP}
                >
                  Verify OTP
                </button>
              </>
            )}

            <p
              className={styles.backText}
              onClick={() => {
                setShowOTPLogin(false);
                setOtpSent(false);
              }}
            >
              ← Back to Login
            </p>
          </>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
