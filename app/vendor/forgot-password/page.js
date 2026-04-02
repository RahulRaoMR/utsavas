"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../vendor-login/vendorLogin.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export default function VendorForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const setError = (message) => {
    setStatus({
      type: "error",
      message,
    });
  };

  const setSuccess = (message) => {
    setStatus({
      type: "success",
      message,
    });
  };

  const sendOtp = async () => {
    if (sendingOtp) return;

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter the registered vendor email address.");
      return;
    }

    try {
      setSendingOtp(true);
      setStatus(null);

      const res = await fetch(`${API}/api/vendor/forgot-password/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await parseJsonSafely(res);

      if (res.ok && data?.success) {
        setStep(2);
        setSuccess(data.message || "OTP sent to your registered email.");
      } else {
        setError(data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Vendor forgot password send OTP error:", error);
      setError("Server not responding. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (verifyingOtp) return;

    if (!otp.trim()) {
      setError("Enter the OTP sent to your registered email.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setStatus(null);

      const res = await fetch(`${API}/api/vendor/forgot-password/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp.trim(),
        }),
      });

      const data = await parseJsonSafely(res);

      if (res.ok && data?.success) {
        setStep(3);
        setSuccess(data.message || "OTP verified. Set a new password.");
      } else {
        setError(data?.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Vendor forgot password verify OTP error:", error);
      setError("Server not responding. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetPassword = async () => {
    if (resettingPassword) return;

    if (!newPassword || !confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setResettingPassword(true);
      setStatus(null);

      const res = await fetch(`${API}/api/vendor/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          newPassword,
        }),
      });

      const data = await parseJsonSafely(res);

      if (res.ok && data?.success) {
        setSuccess(data.message || "Password updated successfully.");
        setTimeout(() => {
          router.push("/vendor/vendor-login");
        }, 1200);
      } else {
        setError(data?.message || "Password reset failed.");
      }
    } catch (error) {
      console.error("Vendor forgot password reset error:", error);
      setError("Server not responding. Please try again.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            <Link href="/" className={styles.titleLink}>
              Vendor Password Reset
            </Link>
          </h1>

          <p className={styles.note}>
            Enter your registered vendor email to receive an OTP and reset your
            password.
          </p>

          {status ? (
            <div
              className={`${styles.statusBanner} ${
                status.type === "error" ? styles.statusError : styles.statusSuccess
              }`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          ) : null}

          <input
            className={styles.input}
            type="email"
            placeholder="Registered Email"
            value={email}
            disabled={step > 1}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status?.type === "error") {
                setStatus(null);
              }
            }}
          />

          {step === 1 ? (
            <button
              className={styles.submitBtn}
              onClick={sendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : null}

          {step === 2 ? (
            <>
              <input
                className={styles.input}
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, ""));
                  if (status?.type === "error") {
                    setStatus(null);
                  }
                }}
              />

              <button
                className={styles.submitBtn}
                onClick={verifyOtp}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                className={styles.secondaryBtn}
                onClick={sendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Resending..." : "Resend OTP"}
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <input
                type="password"
                className={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (status?.type === "error") {
                    setStatus(null);
                  }
                }}
              />

              <input
                type="password"
                className={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (status?.type === "error") {
                    setStatus(null);
                  }
                }}
              />

              <button
                className={styles.submitBtn}
                onClick={resetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? "Updating..." : "Update Password"}
              </button>
            </>
          ) : null}

          <div className={styles.helperRow}>
            <Link href="/vendor/vendor-login" className={styles.helperLink}>
              Back to Vendor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
