import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectDB();

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!vendor.approved) {
      return NextResponse.json(
        { message: "Your account is pending admin approval" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        vendor: {
          id: vendor._id,
          email: vendor.email,
          businessName: vendor.businessName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
