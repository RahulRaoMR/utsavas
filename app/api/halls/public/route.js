import connectDB from "@/lib/mongodb";
import Hall from "@/models/Hall";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") || "").toLowerCase().trim();

    const query = {
      status: "approved",
      ...(category ? { category } : {}),
    };

    const halls = await Hall.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(halls);
  } catch (error) {
    console.error("FETCH HALLS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}
