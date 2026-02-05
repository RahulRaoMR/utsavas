import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

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

    // Check existing vendor
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json(
        { message: "Vendor already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      { message: "Vendor registered successfully", vendor },
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
