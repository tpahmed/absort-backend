import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    id: Number,
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
