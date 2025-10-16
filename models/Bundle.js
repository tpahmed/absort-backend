import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    productIds: [Number],
    price: {
      type: Number,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bundle", bundleSchema);
