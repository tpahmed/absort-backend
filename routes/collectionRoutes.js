import express from "express";
import Collection from "../models/Collection.js";

const router = express.Router();

/**
 * @route   GET /api/collections
 * @desc    Get all collections
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/collections/:id
 * @desc    Get a single collection by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
