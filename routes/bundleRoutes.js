import express from "express";
import Bundle from "../models/Bundle.js";

const router = express.Router();

/**
 * @route   GET /api/bundles
 * @desc    Get all bundles
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const bundles = await Bundle.find().populate("productIds", "title price");
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/bundles/:id
 * @desc    Get one bundle by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id).populate("productIds", "title price");
    if (!bundle) return res.status(404).json({ message: "Bundle not found" });
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
