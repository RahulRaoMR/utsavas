import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    businessName: String,
    ownerName: String,
    phone: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    city: String,
    serviceType: String,
    password: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false, // admin can approve later
    },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor ||
  mongoose.model("Vendor", VendorSchema);
