import mongoose from "mongoose";

const HallSchema = new mongoose.Schema(
  {
    hallName: String,
    pricePerEvent: Number,
    pricePerDay: Number,
    pricePerPlate: Number,
    capacity: Number,
    parkingCapacity: Number,
    category: String,
    images: [String],
    address: {
      area: String,
      city: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Hall || mongoose.model("Hall", HallSchema);