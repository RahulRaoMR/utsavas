"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "./payment.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const ONLINE_PAYMENT_AMOUNT = 50000;

export default function PaymentPage() {
  const router = useRouter();
  const { hallId } = useParams();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [method, setMethod] = useState("payAtVenue");
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  useEffect(() => {
    let mounted = true;
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (window.Razorpay) {
      setScriptReady(true);
    }

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (mounted) {
          setScriptReady(true);
        }
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => {
        if (mounted) {
          setScriptReady(true);
        }
      });
    }

    const fetchPaymentConfig = async () => {
      try {
        const res = await fetch(`${API}/api/payment/config`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (mounted) {
          setRazorpayKeyId(data?.keyId || "");
        }
      } catch (error) {
        console.error("Failed to load payment config", error);
      }
    };

    fetchPaymentConfig();

    return () => {
      mounted = false;
    };
  }, []);

  const updateBookingPayment = async (payload) => {
    if (!bookingId) {
      return;
    }

    const res = await fetch(`${API}/api/bookings/${bookingId}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to update booking payment details");
    }
  };

  const handlePayAtVenue = async () => {
    await updateBookingPayment({
      paymentMethod: "pay_at_venue",
      paymentStatus: "pending",
      amount: 0,
    });

    alert("Booking confirmed. You can pay at the venue.");
    router.push("/my-bookings");
  };

  const handleOnlinePayment = async () => {
    if (!bookingId) {
      alert("Booking reference missing. Please go back and book again.");
      return;
    }

    if (!scriptReady || !window.Razorpay) {
      alert("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    if (!razorpayKeyId) {
      alert("Payment gateway is not configured correctly yet.");
      return;
    }

    const orderRes = await fetch(`${API}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: ONLINE_PAYMENT_AMOUNT,
        bookingId,
      }),
    });

    const order = await orderRes.json().catch(() => ({}));

    if (!orderRes.ok || !order?.id) {
      throw new Error(order.message || "Failed to create payment order");
    }

    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "UTSAVAS",
      description: "Hall Booking Payment",
      order_id: order.id,
      theme: {
        color: "#3f6fb6",
      },
      modal: {
        ondismiss: async () => {
          try {
            await updateBookingPayment({
              paymentMethod: "online",
              paymentStatus: "failed",
              amount: ONLINE_PAYMENT_AMOUNT,
            });
          } catch (error) {
            console.error("Failed to mark dismissed payment", error);
          }
        },
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              amount: ONLINE_PAYMENT_AMOUNT,
              ...response,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));

          if (!verifyRes.ok) {
            throw new Error(verifyData.message || "Payment verification failed");
          }

          alert("Payment successful. Your booking is now recorded.");
          router.push("/my-bookings");
        } catch (error) {
          console.error("Payment verification error", error);
          alert(error.message || "Payment verification failed.");
        } finally {
          setLoading(false);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", async () => {
      try {
        await updateBookingPayment({
          paymentMethod: "online",
          paymentStatus: "failed",
          amount: ONLINE_PAYMENT_AMOUNT,
        });
      } catch (error) {
        console.error("Failed to mark payment failure", error);
      }
    });

    razorpay.open();
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      if (method === "payAtVenue") {
        await handlePayAtVenue();
        return;
      }

      await handleOnlinePayment();
    } catch (error) {
      console.error("Payment error", error);
      alert(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2>Choose payment method to pay</h2>

        <div className={styles.secure}>
          Secure payments for your UTSAVAS booking
        </div>

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

        <div className={styles.info}>
          {method === "payNow"
            ? `Online payment amount: Rs ${ONLINE_PAYMENT_AMOUNT.toLocaleString()}`
            : "No payment needed today. We will confirm your booking and you can pay directly at the venue."}
        </div>

        <button
          className={styles.bookBtn}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Book Now"}
        </button>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    </div>
  );
}
