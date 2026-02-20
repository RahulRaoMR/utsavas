import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb"; // ✅ default import
import Vendor from "@/models/Vendor";

export const runtime = "nodejs"; // ⭐ REQUIRED for mongoose on Vercel

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      businessName,
      ownerName,
      phone,
      email,
      city,
      serviceType,
      password,
    } = body;

    // ✅ basic validation
    if (!businessName || !email || !password) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    // ✅ check existing vendor
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json(
        { message: "Vendor already exists" },
        { status: 400 }
      );
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ create vendor
    const vendor = await Vendor.create({
      businessName,
      ownerName,
      phone,
      email,
      city,
      serviceType,
      password: hashedPassword,
      status: "pending", // admin approval
    });

    return NextResponse.json(
      {
        message: "Vendor registered successfully",
        vendor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor Register Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}