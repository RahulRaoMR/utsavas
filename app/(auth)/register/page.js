"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../login/login.module.css";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  /* =========================
     STATE
  ========================= */
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

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  /* =========================
     SEND OTP
  ========================= */
  const sendOTP = async () => {
    if (loading || timer > 0) return;

    try {
      setLoading(true);
      const cleanPhone = phone.replace("+", "");

      const res = await fetch("http://localhost:5000/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP sent successfully ✅");
        setOtpSent(true);
        setTimer(30);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  /* =========================
     OTP INPUT
  ========================= */
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

  /* =========================
     VERIFY OTP
  ========================= */
  const verifyOTP = async () => {
    try {
      const cleanPhone = phone.replace("+", "");
      const finalOtp = otp.join("");

      const res = await fetch("http://localhost:5000/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: finalOtp }),
      });

      const data = await res.json();

      if (data.success) {
        setVerified(true);
        alert("Phone verified ✅");
      } else {
        alert(data.message || "Invalid OTP ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  /* =========================
     HANDLE FORM
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     REGISTER USER
  ========================= */
  const registerUser = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const cleanPhone = phone.replace("+", "");

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        alert("Registration successful 🎉");
        router.push("/dashboard");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  /* =========================
     UI
  ========================= */
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
            <input name="firstName" placeholder="First Name" className={styles.inputField} onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" className={styles.inputField} onChange={handleChange} />
            <input name="email" placeholder="Email" className={styles.inputField} onChange={handleChange} />
            <input name="city" placeholder="City" className={styles.inputField} onChange={handleChange} />
            <input name="country" placeholder="Country" className={styles.inputField} onChange={handleChange} />

            {/* ✅ FIXED PREMIUM SELECT */}
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

            <input name="password" type="password" placeholder="Password" className={styles.inputField} onChange={handleChange} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" className={styles.inputField} onChange={handleChange} />

            <button className={styles.loginBtn} onClick={registerUser}>
              Register Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
