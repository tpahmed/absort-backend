import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    items: [
      {
        type: { type: String, enum: ["product", "bundle"], required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        bundleId: { type: mongoose.Schema.Types.ObjectId, ref: "Bundle" },
        title: String,
        quantity: Number,
        price: Number,
        variants: Object,
        products: Array // for bundles
      }
    ],
    shippingInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: false },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: String
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Generate order number before save
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
