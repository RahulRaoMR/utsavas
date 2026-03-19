import connectDB from "@/lib/mongodb";
import Hall from "@/models/Hall";
import { normalizeVenueCategory } from "@/lib/venueCategories";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = normalizeVenueCategory(searchParams.get("category"));

    const halls = await Hall.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    const filteredHalls = category
      ? halls.filter((hall) => normalizeVenueCategory(hall.category) === category)
      : halls;

    return NextResponse.json(filteredHalls);
  } catch (error) {
    console.error("FETCH HALLS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}
