"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyBookingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile#bookings");
  }, [router]);

  return null;
}
