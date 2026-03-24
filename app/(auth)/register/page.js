"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../login/login.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { karnatakaDistricts } from "../../components/karnatakaDistricts";
import { clearUserSession, sanitizeRedirectPath } from "../../../lib/authRedirect";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [verified, setVerified] = useState(false);
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

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
  const redirectPath = sanitizeRedirectPath(
    searchParams.get("redirect"),
    "/dashboard"
  );

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
    if (loading || timer > 0) return;

    try {
      setLoading(true);

      const cleanPhone = phone.replace("+", "");

      const res = await fetch(`${API}/api/otp/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("OTP sent successfully");
        setOtpSent(true);
        setTimer(30);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP error:", err);
      alert("Server not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
    try {
      const cleanPhone = phone.replace("+", "");
      const finalOtp = otp.join("");

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
        alert("Phone verified");
        setVerified(true);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert("Verification failed");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const cleanPhone = phone.replace("+", "");

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

        alert("Registration successful");
        router.replace(redirectPath);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>UTSAVAS</h1>
        <p className={styles.tagline}>Create your account</p>

        {!verified ? (
          <>
            <input
              type="text"
              placeholder="Phone Number (+91XXXXXXXXXX)"
              className={styles.inputField}
              value={phone}
              onChange={(e) => {
                if (!e.target.value.startsWith("+91")) return;
                setPhone(e.target.value);
              }}
            />

            <button
              className={styles.loginBtn}
              onClick={sendOTP}
              disabled={loading || timer > 0}
            >
              {loading
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
                        border: "2px solid #6b1d2b",
                        outline: "none",
                        background: "#860b19",
                        fontWeight: "600",
                      }}
                    />
                  ))}
                </div>

                <button
                  className={styles.loginBtn}
                  onClick={verifyOTP}
                  style={{ marginTop: "14px" }}
                >
                  Verify OTP
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <input
              name="firstName"
              placeholder="First Name"
              className={styles.inputField}
              onChange={handleChange}
            />

            <input
              name="lastName"
              placeholder="Last Name"
              className={styles.inputField}
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              className={styles.inputField}
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
              onChange={handleChange}
            />

            <select
              name="gender"
              className={styles.inputField}
              onChange={handleChange}
              defaultValue=""
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
              onChange={handleChange}
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className={styles.inputField}
              onChange={handleChange}
            />

            <button className={styles.loginBtn} onClick={registerUser}>
              Register Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
