import Order from "../models/Order.js";
import User from "../models/User.js";
import axios from "axios";

// Helper function to verify reCAPTCHA
const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Add this to your .env file
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const response = await axios.post(verifyUrl);
    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status,
      saveInfo,
      recaptchaToken,
      isGuest
    } = req.body;

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA verification required" });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Validate required shipping info
    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone || 
        !shippingInfo.address || !shippingInfo.city) {
      return res.status(400).json({ message: "Missing required shipping information" });
    }

    // Create order object
    const orderData = {
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status: status || 'pending',
      isGuest: isGuest || false
    };

    // Add user ID if authenticated
    if (req.user && req.user._id) {
      orderData.user = req.user._id;
    }

    const order = new Order(orderData);
    const createdOrder = await order.save();

    // Update user profile if authenticated and saveInfo is true
    if (!isGuest && req.user && req.user._id && saveInfo && shippingInfo) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            name: shippingInfo.fullName,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
          },
        },
        { new: true }
      );
    }

    // Generate order number
    const orderNumber = `#${createdOrder._id.toString().slice(-6).toUpperCase()}`;

    res.status(201).json({
      ...createdOrder.toObject(),
      orderNumber
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ message: "Error retrieving order" });
  }
};

// New endpoint for guest order tracking (optional)
export const getGuestOrderByEmail = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({ message: "Order number and email required" });
    }

    const order = await Order.findOne({
      _id: orderNumber.replace('#', ''),
      'shippingInfo.email': email,
      isGuest: true
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error retrieving guest order:", error);
    res.status(500).json({ message: "Error retrieving order" });
  }
};