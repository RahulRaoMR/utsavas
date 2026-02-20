import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/* ======================
   GET – List Vendors
====================== */
export async function GET() {
  try {
    await connectDB();

    const vendors = await Vendor.find({}, { businessName: 1 });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("GET VENDORS ERROR ❌", error);
    return NextResponse.json(
      { message: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

/* ======================
   POST – Add Vendor (ADMIN)
====================== */
export async function POST(req) {
  try {
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
      status: "approved",
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("CREATE VENDOR ERROR ❌", error);
    return NextResponse.json(
      { message: "Failed to create vendor" },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE – Delete Vendor (ADMIN)
====================== */
export async function DELETE(req) {
  try {
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
  } catch (error) {
    console.error("DELETE VENDOR ERROR ❌", error);
    return NextResponse.json(
      { message: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}