import mongoose from "mongoose";

const HallSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      index: true,
    },
    hallName: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      lowercase: true,
      index: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    parkingCapacity: {
      type: Number,
      default: 0,
    },
    rooms: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: "",
    },
    pricePerPlate: {
      type: Number,
      default: 0,
    },
    pricePerDay: {
      type: Number,
      default: 0,
    },
    pricePerEvent: {
      type: Number,
      default: 0,
    },
    address: {
      flat: String,
      floor: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Hall || mongoose.model("Hall", HallSchema);
