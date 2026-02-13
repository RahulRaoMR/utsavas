import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/* ======================
   GET – List Vendors
====================== */
export async function GET() {
  await connectDB();
  const vendors = await Vendor.find({}, { businessName: 1 });
  return NextResponse.json(vendors);
}

/* ======================
   POST – Add Vendor (ADMIN)
====================== */
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const {
    businessName,
    ownerName,
    email,
    phone,
    city,
    serviceType,
    password,
  } = body;

  if (!businessName || !email || !password) {
    return NextResponse.json(
      { message: "Required fields missing" },
      { status: 400 }
    );
  }

  const vendor = await Vendor.create({
    businessName,
    ownerName,
    email,
    phone,
    city,
    serviceType,
    password,
    status: "approved", // Admin-added = auto approved
  });

  return NextResponse.json(vendor, { status: 201 });
}

/* ======================
   DELETE – Delete Vendor (ADMIN)
====================== */
export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { message: "Vendor ID required" },
      { status: 400 }
    );
  }

  await Vendor.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
