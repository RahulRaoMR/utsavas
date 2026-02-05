"use client";
import { useState } from "react";
import styles from "../login/login.module.css";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [verified, setVerified] = useState(false);
  const router = useRouter(); // ✅ added

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>UTSAVAM</h1>
        <p className={styles.tagline}>Create your account</p>

        {!verified ? (
          <>
            <input
              type="text"
              placeholder="Phone Number (+91)"
              className={styles.inputField}
              defaultValue="+91"
            />

            <button className={styles.loginBtn}>
              Send OTP
            </button>

            <input
              type="text"
              placeholder="Enter OTP"
              className={styles.inputField}
            />

            <button
              className={styles.loginBtn}
              onClick={() => setVerified(true)}
            >
              Verify OTP
            </button>
          </>
        ) : (
          <>
            <input type="text" placeholder="First Name" className={styles.inputField} />
            <input type="text" placeholder="Last Name" className={styles.inputField} />
            <input type="email" placeholder="Email" className={styles.inputField} />
            <input type="text" placeholder="City" className={styles.inputField} />
            <input type="text" placeholder="Country" className={styles.inputField} />

            <select className={styles.inputField}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input type="password" placeholder="Password" className={styles.inputField} />
            <input type="password" placeholder="Confirm Password" className={styles.inputField} />

            <button
              className={styles.loginBtn}
              onClick={() => router.push("/dashboard")} // ✅ redirect
            >
              Register Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
