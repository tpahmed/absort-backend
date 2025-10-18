import Order from "../models/Order.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status,
      saveInfo,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    const order = new Order({
      user: userId,
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status,
    });

    const createdOrder = await order.save();

    if (saveInfo && shippingInfo) {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            name: shippingInfo.fullName,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            zipCode: shippingInfo.zipCode,
          },
        },
        { new: true }
      );
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .exec();

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order" });
  }
};
