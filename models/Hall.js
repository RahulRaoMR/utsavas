import mongoose from "mongoose";
import {
  LISTING_PLAN_VALUES,
  getListingPlanPriority,
  normalizeListingPlan,
} from "../lib/listingPlans";

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
    reviews: {
      type: [
        new mongoose.Schema(
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },
            reviewerName: {
              type: String,
              trim: true,
              default: "",
            },
            reviewerEmail: {
              type: String,
              trim: true,
              lowercase: true,
              default: "",
            },
            rating: {
              type: Number,
              min: 1,
              max: 5,
              default: 5,
            },
            comment: {
              type: String,
              trim: true,
              default: "",
            },
            photos: {
              type: [String],
              default: [],
            },
          },
          { _id: true, timestamps: true }
        ),
      ],
      default: [],
    },
    listingPlan: {
      type: String,
      enum: LISTING_PLAN_VALUES,
      default: "basic",
      index: true,
    },
    listingPriority: {
      type: Number,
      default: getListingPlanPriority("basic"),
      index: true,
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

HallSchema.pre("validate", function (next) {
  this.listingPlan = normalizeListingPlan(this.listingPlan);
  this.listingPriority = getListingPlanPriority(this.listingPlan);
  next();
});

export default mongoose.models.Hall || mongoose.model("Hall", HallSchema);
