import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getOrderById
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

export default router;
