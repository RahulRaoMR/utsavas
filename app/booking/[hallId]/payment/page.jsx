"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./payment.module.css";
import {
  BOOKING_GST_HSN_CODE,
  BOOKING_GST_RATE,
  formatBookingGstLabel,
} from "../../../../lib/bookingInvoice";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const ONLINE_PAYMENT_AMOUNT = 50000;
const FALLBACK_RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const couponCode = searchParams.get("coupon") || "";
  const taxableAmount = Number(searchParams.get("baseAmount")) || 0;
  const gstAmount = Number(searchParams.get("gstAmount")) || 0;
  const discountAmount = Number(searchParams.get("discount")) || 0;
  const quotedAmount = Number(searchParams.get("amount")) || ONLINE_PAYMENT_AMOUNT;
  const gstRate = Number(searchParams.get("gstRate")) || BOOKING_GST_RATE;
  const gstHsnCode = searchParams.get("hsn") || BOOKING_GST_HSN_CODE;
  const venueAmount = taxableAmount + discountAmount;

  const [method, setMethod] = useState("payAtVenue");
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    redirectTo: "",
  });

  const getAuthToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const getRedirectPath = () => {
    if (typeof window === "undefined") {
      return "/my-bookings";
    }

    return `${window.location.pathname}${window.location.search}`;
  };

  const redirectToLogin = () => {
    router.replace(`/login?redirect=${encodeURIComponent(getRedirectPath())}`);
  };

  const openDialog = ({ title = "UTSAVAS", message, redirectTo = "" }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      redirectTo,
    });
  };

  const closeDialog = () => {
    const redirectTo = dialog.redirectTo;

    setDialog({
      isOpen: false,
      title: "",
      message: "",
      redirectTo: "",
    });

    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

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
        if (!res.ok) {
          throw new Error(`Payment config request failed with ${res.status}`);
        }

        const data = await res.json().catch(() => ({}));

        if (mounted) {
          setRazorpayKeyId(data?.keyId || FALLBACK_RAZORPAY_KEY_ID);
        }
      } catch (error) {
        console.error("Failed to load payment config", error);
        if (mounted) {
          setRazorpayKeyId(FALLBACK_RAZORPAY_KEY_ID);
        }
      }
    };

    fetchPaymentConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/my-bookings";

      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [router]);

  const updateBookingPayment = async (payload) => {
    if (!bookingId) {
      return false;
    }

    const token = getAuthToken();

    if (!token) {
      redirectToLogin();
      return false;
    }

    try {
      const res = await fetch(`${API}/api/bookings/${bookingId}/payment`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          redirectToLogin();
        }

        console.warn(
          "Booking payment update endpoint unavailable",
          data.message || res.status
        );
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Failed to update booking payment details", error);
      return false;
    }
  };

  const handlePayAtVenue = async () => {
    if (!getAuthToken()) {
      redirectToLogin();
      return;
    }

    await updateBookingPayment({
      paymentMethod: "pay_at_venue",
      paymentStatus: "pending",
      amount: quotedAmount,
    });

    setLoading(false);
    openDialog({
      title: "Booking Confirmed",
      message: "Booking confirmed. You can pay at the venue.",
      redirectTo: "/my-bookings",
    });
  };

  const handleOnlinePayment = async () => {
    if (!bookingId) {
      setLoading(false);
      openDialog({
        title: "Booking Reference Missing",
        message: "Booking reference missing. Please go back and book again.",
      });
      return;
    }

    if (!getAuthToken()) {
      redirectToLogin();
      return;
    }

    if (!scriptReady || !window.Razorpay) {
      setLoading(false);
      openDialog({
        title: "Payment Gateway Loading",
        message: "Payment gateway is still loading. Please try again in a moment.",
      });
      return;
    }

    if (!razorpayKeyId) {
      setLoading(false);
      openDialog({
        title: "Payment Unavailable",
        message: "Payment gateway is not configured correctly yet.",
      });
      return;
    }

    const orderRes = await fetch(`${API}/api/payment/create-order`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: quotedAmount,
        bookingId,
      }),
    });

    const order = await orderRes.json().catch(() => ({}));

    if (orderRes.status === 401) {
      redirectToLogin();
      throw new Error("Please log in again to continue payment.");
    }

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
              amount: quotedAmount,
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
            headers: getAuthHeaders(),
            body: JSON.stringify({
              bookingId,
              amount: quotedAmount,
              ...response,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));

          if (verifyRes.status === 401) {
            redirectToLogin();
            throw new Error("Please log in again to verify your payment.");
          }

          if (!verifyRes.ok) {
            const fallbackUpdated = await updateBookingPayment({
              paymentMethod: "online",
              paymentStatus: "paid",
              amount: quotedAmount,
            });

            if (!fallbackUpdated) {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          }

          openDialog({
            title: "Payment Successful",
            message: "Payment successful. Your booking is now recorded.",
            redirectTo: "/my-bookings",
          });
        } catch (error) {
          console.error("Payment verification error", error);
          openDialog({
            title: "Payment Verification Failed",
            message: error.message || "Payment verification failed.",
          });
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
          amount: quotedAmount,
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
      openDialog({
        title: "Payment Failed",
        message: error.message || "Payment failed. Please try again.",
      });
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
          {method === "payNow" ? (
            <>
              <p>
                Total bill payable online: Rs {quotedAmount.toLocaleString("en-IN")}
              </p>
              <div className={styles.infoBreakdown}>
                <span>Venue amount</span>
                <strong>Rs {venueAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Coupon discount</span>
                <strong>- Rs {discountAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Taxable value</span>
                <strong>Rs {taxableAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>
                  {formatBookingGstLabel({
                    gstRate,
                    hsnCode: gstHsnCode,
                  })}
                </span>
                <strong>Rs {gstAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Total bill</span>
                <strong>Rs {quotedAmount.toLocaleString("en-IN")}</strong>
              </div>
              {couponCode ? (
                <p>
                  Coupon <strong>{couponCode}</strong> saved Rs{" "}
                  {discountAmount.toLocaleString("en-IN")} before GST.
                </p>
              ) : null}
              <p>
                Calculation: venue amount - coupon discount = taxable value, then
                {` `}
                {formatBookingGstLabel({
                  gstRate,
                  hsnCode: gstHsnCode,
                })}
                {` `}
                is added to get the total bill.
              </p>
            </>
          ) : (
            <>
              <p>
                No payment needed today. Amount due at venue: Rs{" "}
                {quotedAmount.toLocaleString("en-IN")}.
              </p>
              <div className={styles.infoBreakdown}>
                <span>Venue amount</span>
                <strong>Rs {venueAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Coupon discount</span>
                <strong>- Rs {discountAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Taxable value</span>
                <strong>Rs {taxableAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>
                  {formatBookingGstLabel({
                    gstRate,
                    hsnCode: gstHsnCode,
                  })}
                </span>
                <strong>Rs {gstAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className={styles.infoBreakdown}>
                <span>Total bill</span>
                <strong>Rs {quotedAmount.toLocaleString("en-IN")}</strong>
              </div>
              <p>
                Calculation: venue amount - coupon discount = taxable value, then
                {` `}
                {formatBookingGstLabel({
                  gstRate,
                  hsnCode: gstHsnCode,
                })}
                {` `}
                is added to get the total bill.
              </p>
            </>
          )}
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

      {dialog.isOpen ? (
        <div className={styles.dialogOverlay} role="presentation">
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
          >
            <h3 id="payment-dialog-title">{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button
              type="button"
              className={styles.dialogButton}
              onClick={closeDialog}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className={styles.page}></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
