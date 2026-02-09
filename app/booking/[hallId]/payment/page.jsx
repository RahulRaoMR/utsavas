"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./payment.module.css";

export default function PaymentPage() {
  const router = useRouter();
  const { hallId } = useParams();

  const [method, setMethod] = useState("payAtVenue");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD RAZORPAY SCRIPT
  ========================= */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* =========================
     HANDLE PAYMENT
  ========================= */
  const handlePayment = async () => {
    if (method === "payAtVenue") {
      alert("🎉 Booking confirmed! Pay at venue.");
      router.push("/"); // later → success page
      return;
    }

    // PAY NOW (RAZORPAY)
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 50000, // temporary amount (₹50,000)
          }),
        }
      );

      const order = await res.json();

      const options = {
        key: "rzp_test_SCPdofdl0uo5pU", // 🔑 REPLACE WITH YOUR KEY
        amount: order.amount,
        currency: "INR",
        name: "UTSAVAS",
        description: "Hall Booking Payment",
        order_id: order.id,
        theme: {
          color: "#6b1d2b", // 🔥 UTSAVAS theme
        },
        handler: function () {
          alert("✅ Payment Successful!");
          router.push("/"); // later → success page
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert("❌ Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2>Choose payment method to pay</h2>

        <div className={styles.secure}>
          🔒 100% safe and secure payments
        </div>

        {/* PAYMENT OPTIONS */}
        <div className={styles.methods}>
          <div
            className={`${styles.method} ${
              method === "payAtVenue" ? styles.active : ""
            }`}
            onClick={() => setMethod("payAtVenue")}
          >
            <h3>Pay At Venue</h3>
            <p>No payment needed today</p>
          </div>

          <div
            className={`${styles.method} ${
              method === "payNow" ? styles.active : ""
            }`}
            onClick={() => setMethod("payNow")}
          >
            <h3>Pay Now</h3>
            <p>UPI / Card / NetBanking</p>
          </div>
        </div>

        {/* INFO */}
        <div className={styles.info}>
          ⭐ No payment needed today <br />
          We will confirm your booking without any charge.
          Pay directly at the venue.
        </div>

        {/* ACTION */}
        <button
          className={styles.bookBtn}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Book Now"}
        </button>
      </div>
    </div>
  );
}
