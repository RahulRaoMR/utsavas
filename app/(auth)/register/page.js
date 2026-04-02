"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import styles from "../login/login.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { karnatakaDistricts } from "../../components/karnatakaDistricts";
import { clearUserSession, sanitizeRedirectPath } from "../../../lib/authRedirect";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";
const EMPTY_OTP = ["", "", "", "", "", ""];

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [verified, setVerified] = useState(false);
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const inputsRef = useRef([]);
  const firstNameRef = useRef(null);
  const redirectPath = sanitizeRedirectPath(
    searchParams.get("redirect"),
    "/dashboard"
  );
  const isPhoneValid = /^91\d{10}$/.test(phone.replace(/\D/g, ""));
  const finalOtp = otp.join("");

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (otpSent && !verified) {
      inputsRef.current[0]?.focus();
    }
  }, [otpSent, verified]);

  useEffect(() => {
    if (verified) {
      firstNameRef.current?.focus();
    }
  }, [verified]);

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

  const sendOTP = async () => {
    if (sendingOtp || timer > 0) return;

    if (!isPhoneValid) {
      setStatus({
        type: "error",
        message: "Enter a valid Indian mobile number to receive your OTP.",
      });
      return;
    }

    try {
      setSendingOtp(true);
      setStatus(null);

      const cleanPhone = phone.replace(/\D/g, "");

      const res = await fetch(`${API}/api/otp/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const providerAccepted = data.smsDelivery === "provider_accepted";
        setOtp(EMPTY_OTP);
        setOtpSent(true);
        setTimer(30);
        setVerified(false);
        setStatus({
          type: providerAccepted ? "success" : "error",
          message: providerAccepted
            ? "OTP sent successfully. Enter the 6-digit code to continue."
            : data.message || "SMS delivery is pending. Please try again.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to send OTP",
        });
      }
    } catch (err) {
      console.error("OTP error:", err);
      setStatus({
        type: "error",
        message: "Server not responding. Please try again.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (status?.type === "error") {
      setStatus(null);
    }

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    if (verifyingOtp) return;

    if (finalOtp.length !== 6) {
      setStatus({
        type: "error",
        message: "Enter the full 6-digit OTP before verifying.",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      setStatus(null);
      const cleanPhone = phone.replace(/\D/g, "");

      const res = await fetch(`${API}/api/otp/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: finalOtp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setVerified(true);
        setStatus({
          type: "success",
          message:
            "Phone verified. Complete your profile to finish creating your account.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Invalid OTP",
        });
      }
    } catch (err) {
      console.error("Verify error:", err);
      setStatus({
        type: "error",
        message: "Verification failed",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChange = (e) => {
    if (status?.type === "error") {
      setStatus(null);
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async () => {
    if (registering) return;

    try {
      if (form.password !== form.confirmPassword) {
        setStatus({
          type: "error",
          message: "Passwords do not match",
        });
        return;
      }

      setRegistering(true);
      setStatus(null);
      const cleanPhone = phone.replace(/\D/g, "");

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);

        const serverUser = data.user || {};
        const fallbackUser = {
          firstName: form.firstName || "",
          lastName: form.lastName || "",
          name:
            `${form.firstName || ""} ${form.lastName || ""}`.trim() ||
            form.email ||
            cleanPhone,
          email: form.email || "",
          phone: cleanPhone,
        };

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...fallbackUser,
            ...serverUser,
            firstName: serverUser.firstName || fallbackUser.firstName,
            lastName: serverUser.lastName || fallbackUser.lastName,
            name:
              serverUser.name ||
              fallbackUser.name ||
              `${serverUser.firstName || ""} ${serverUser.lastName || ""}`.trim(),
          })
        );

        setStatus({
          type: "success",
          message: "Registration successful. Redirecting...",
        });
        router.replace(redirectPath);
      } else {
        setStatus({
          type: "error",
          message: data.message || "Registration failed",
        });
      }
    } catch (err) {
      console.error("Register error:", err);
      setStatus({
        type: "error",
        message: "Something went wrong",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>UTSAVAS</h1>
        <p className={styles.tagline}>Create your account</p>
        {status ? (
          <p
            className={`${styles.statusBanner} ${
              status.type === "error" ? styles.statusError : styles.statusSuccess
            }`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}

        {!verified ? (
          <>
            <input
              type="tel"
              placeholder="Phone Number (+91XXXXXXXXXX)"
              className={styles.inputField}
              value={phone}
              autoComplete="tel"
              onChange={(e) => {
                if (!e.target.value.startsWith("+91")) return;
                if (status) {
                  setStatus(null);
                }
                if (otpSent) {
                  setOtp(EMPTY_OTP);
                  setOtpSent(false);
                  setTimer(0);
                }
                setPhone(e.target.value);
              }}
            />

            <button
              className={styles.loginBtn}
              onClick={sendOTP}
              disabled={sendingOtp || timer > 0}
            >
              {sendingOtp
                ? "Sending..."
                : timer > 0
                ? `Resend in ${timer}s`
                : otpSent
                ? "Resend OTP"
                : "Send OTP"}
            </button>

            {otpSent && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "14px",
                  }}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      maxLength="1"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(e.target.value, index)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      style={{
                        width: "48px",
                        height: "54px",
                        textAlign: "center",
                        fontSize: "22px",
                        borderRadius: "12px",
                        border: "2px solid #e3ebf7",
                        outline: "none",
                        background: "#ffffff",
                        color: "#30402f",
                        fontWeight: "600",
                      }}
                    />
                  ))}
                </div>

                <button
                  className={styles.loginBtn}
                  onClick={verifyOTP}
                  disabled={verifyingOtp || finalOtp.length !== 6}
                  style={{ marginTop: "14px" }}
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <input
              ref={firstNameRef}
              name="firstName"
              placeholder="First Name"
              className={styles.inputField}
              value={form.firstName}
              autoComplete="given-name"
              onChange={handleChange}
            />

            <input
              name="lastName"
              placeholder="Last Name"
              className={styles.inputField}
              value={form.lastName}
              autoComplete="family-name"
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              className={styles.inputField}
              value={form.email}
              autoComplete="email"
              onChange={handleChange}
            />

            <select
              name="city"
              className={styles.inputField}
              onChange={handleChange}
              value={form.city}
            >
              <option value="">City</option>
              {karnatakaDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <input
              name="country"
              placeholder="Country"
              className={styles.inputField}
              value={form.country}
              autoComplete="country-name"
              onChange={handleChange}
            />

            <select
              name="gender"
              className={styles.inputField}
              value={form.gender}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              name="password"
              type="password"
              placeholder="Password"
              className={styles.inputField}
              value={form.password}
              autoComplete="new-password"
              onChange={handleChange}
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className={styles.inputField}
              value={form.confirmPassword}
              autoComplete="new-password"
              onChange={handleChange}
            />

            <button
              className={styles.loginBtn}
              onClick={registerUser}
              disabled={registering}
            >
              {registering ? "Creating Account..." : "Register Now"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.loginContainer}></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
