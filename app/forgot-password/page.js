"use client";

import { useState } from "react";
import styles from "../(auth)/login/login.module.css";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SEND OTP
  const sendOtp = async () => {
    setLoading(true);

    const cleanPhone = phone.replace("+", "");

    const res = await fetch(
      "http://localhost:5000/api/auth/forgot-password/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("OTP sent ✅");
      setStep(2);
    } else {
      alert(data.message);
    }

    setLoading(false);
  };

  // ================= VERIFY OTP
  const verifyOtp = async () => {
    const cleanPhone = phone.replace("+", "");

    const res = await fetch(
      "http://localhost:5000/api/auth/forgot-password/verify-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setStep(3);
    } else {
      alert(data.message);
    }
  };

  // ================= RESET PASSWORD
  const resetPassword = async () => {
    const cleanPhone = phone.replace("+", "");

    const res = await fetch(
      "http://localhost:5000/api/auth/forgot-password/reset",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Password reset successful ✅");
      router.push("/login");
    } else {
      alert("Failed");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>UTSAVAS</h1>
        <p className={styles.tagline}>Reset your password</p>

        {step === 1 && (
          <>
            <input
              className={styles.inputField}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button className={styles.loginBtn} onClick={sendOtp}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className={styles.inputField}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className={styles.loginBtn} onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              className={styles.inputField}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button className={styles.loginBtn} onClick={resetPassword}>
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
